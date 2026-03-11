const Product = require("../models/Product");
const { redisClient } = require("../config/redis");
const { elasticClient } = require("../config/elastic");
const { logEvent } = require("../middleware/logger");

// Helper to clear product caches on data mutation
const clearProductCache = async (id = null) => {
  try {
    if (!redisClient.isReady) return;
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    if (id) {
      await redisClient.del(`product:${id}`);
    }
  } catch (err) {
    console.error("Redis cache clear error:", err.message);
  }
};

// Helper to sync single product to Elastic
const syncToElastic = async (product, deleted = false) => {
  if (process.env.NODE_ENV === "test") return;
  try {
    if (deleted) {
      await elasticClient.delete({
        index: "products",
        id: product._id.toString(),
        refresh: true,
      });
    } else {
      await elasticClient.index({
        index: "products",
        id: product._id.toString(),
        document: {
          title: product.title,
          description: product.description,
          category: product.category,
          brand: product.brand,
          price: product.price,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          images: product.images,
          rating: product.rating,
          numReviews: product.numReviews,
          discountPercentage: product.discountPercentage,
        },
        refresh: true,
      });
    }
  } catch (err) {
    console.error("Elasticsearch sync error:", err.message);
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    if (redisClient.isReady) {
      const cacheKey = `products:${req.originalUrl}`;
      const cachedProducts = await redisClient.get(cacheKey);
      if (cachedProducts) {
        if (req.logMeta) req.logMeta.search_engine = "redis";
        return res.status(200).json(JSON.parse(cachedProducts));
      }
    }

    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Format special flat keys like field[operator] (e.g., category[in]) into nested objects
    Object.keys(reqQuery).forEach(key => {
      const match = key.match(/^(.+)\[(.+)\]$/);
      if (match) {
        const field = match[1];
        const operator = match[2];
        reqQuery[field] = reqQuery[field] || {};
        reqQuery[field][operator] = reqQuery[key];
        delete reqQuery[key];
      }
    });

    // Fields to exclude
    const removeFields = ["select", "sort", "page", "limit", "keyword", "search"];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`,
    );

    let mongoQuery = JSON.parse(queryStr);

    // Only show active products in public queries (admins see all via the admin dashboard)
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      mongoQuery.isActive = true;
    }

    // Handle comma-separated values for $in operator
    Object.keys(mongoQuery).forEach((key) => {
      if (mongoQuery[key].$in && typeof mongoQuery[key].$in === "string") {
        mongoQuery[key].$in = mongoQuery[key].$in.split(",").map(val => val.trim());
      }
    });

    // Handle Keyword Search with Elasticsearch
    if (req.query.keyword) {
      try {
        const esQuery = {
          bool: {
            must: [
              {
                multi_match: {
                  query: req.query.keyword,
                  fields: ["title^3", "description", "category", "brand"],
                  fuzziness: "AUTO:3,6",
                  prefix_length: 0,
                },
              },
            ],
          },
        };
        // Filter out hidden products for non-admin users
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
          esQuery.bool.filter = [{ term: { isActive: true } }];
        }
        const result = await elasticClient.search({
          index: "products",
          body: { query: esQuery },
        });

        const ids = result.hits.hits.map((hit) => hit._id);
        mongoQuery._id = { $in: ids };
        if (req.logMeta) {
          req.logMeta.search_engine = "elasticsearch";
          req.logMeta.keyword = req.query.keyword;
          req.logMeta.is_search = true;
        }
      } catch (err) {
        console.error(
          "Elasticsearch search error, falling back to basic regex:",
          err.message,
        );
        // Fallback to basic regex if ES is down
        mongoQuery.title = { $regex: req.query.keyword, $options: "i" };
      }
    }

    // Finding resource
    query = Product.find(mongoQuery);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(mongoQuery);

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const products = await query.populate("user", "name email");

    if (req.logMeta) {
      if (!req.logMeta.search_engine) req.logMeta.search_engine = "mongodb";
      req.logMeta.results_count = products.length;
      if (req.query.keyword) {
        req.logMeta.keyword = req.query.keyword;
        req.logMeta.is_search = true;
      }
    }

    // Pagination result
    const responseData = {
      success: true,
      count: products.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: products,
    };

    if (redisClient.isReady) {
      const cacheKey = `products:${req.originalUrl}`;
      await redisClient.setEx(cacheKey, 60, JSON.stringify(responseData)); // 60 seconds
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`Fetch Products Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Server Error: Could not fetch products",
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    if (redisClient.isReady) {
      const cacheKey = `product:${req.params.id}`;
      const cachedProduct = await redisClient.get(cacheKey);
      if (cachedProduct) {
        if (req.logMeta) req.logMeta.search_engine = "redis";
        return res.status(200).json(JSON.parse(cachedProduct));
      }
    }

    const product = await Product.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (req.logMeta) req.logMeta.search_engine = "mongodb";

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const responseData = { success: true, data: product };

    // Track Activity: Product viewed
    logEvent({
      action: "Product Viewed",
      description: `User viewed product: ${product.title}`,
      req,
      status: "success"
    });

    if (redisClient.isReady) {
      const cacheKey = `product:${req.params.id}`;
      await redisClient.setEx(cacheKey, 60, JSON.stringify(responseData)); // 60 seconds
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`Fetch Product Error: ${error.message}`);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Could not fetch product" });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Superuser
exports.createProduct = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user._id;

    const product = await Product.create(req.body);
    await syncToElastic(product);
    await clearProductCache();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error(`Create Product Error: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Superuser
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await syncToElastic(product);
    await clearProductCache(product._id);

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error(`Update Product Error: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Superuser
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    await product.deleteOne();
    await syncToElastic(product, true);
    await clearProductCache(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(`Delete Product Error: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString(),
      );

      if (alreadyReviewed) {
        return res
          .status(400)
          .json({ success: false, error: "Product already reviewed" });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      await syncToElastic(product);
      await clearProductCache(req.params.id);
      res.status(201).json({ success: true, message: "Review added" });
    } else {
      res.status(404).json({ success: false, error: "Product not found" });
    }
  } catch (error) {
    console.error(`Create Review Error: ${error.message}`);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Review failed" });
  }
};

// @desc    Get search suggestions (Auto-complete)
// @route   GET /api/products/suggestions
// @access  Public
exports.getSearchSuggestions = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(200).json({ success: true, data: [] });
    }

    const result = await elasticClient.search({
      index: "products",
      body: {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: keyword,
                  type: "bool_prefix",
                  fields: [
                    "title.suggest",
                    "title.suggest._2gram",
                    "title.suggest._3gram",
                  ],
                  boost: 2,
                },
              },
              {
                multi_match: {
                  query: keyword,
                  fields: ["title^3", "category", "brand"],
                  fuzziness: "AUTO:3,6",
                  prefix_length: 0,
                },
              },
            ],
            filter: [{ term: { isActive: true } }],
          },
        },
      },
    });

    const suggestions = result.hits.hits.map((hit) => ({
      _id: hit._id,
      title: hit._source.title,
      category: hit._source.category,
    }));

    if (req.logMeta) {
      req.logMeta.search_engine = "elasticsearch";
      req.logMeta.keyword = keyword;
      req.logMeta.is_search = true;
      req.logMeta.search_type = "suggestion";
      req.logMeta.results_count = suggestions.length;
    }

    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    console.error(`Suggestions Error: ${error.message}`);
    res.status(500).json({ success: false, error: "Suggestions failed" });
  }
};

// @desc    Get product recommendations
// @route   GET /api/products/recommendations
// @access  Public
exports.getRecommendations = async (req, res, next) => {
  try {
    const result = await elasticClient.search({
      index: "products",
      body: {
        size: 0,
        query: {
          bool: {
            filter: [{ term: { isActive: true } }],
          },
        },
        aggs: {
          trending_categories: {
            terms: {
              field: "category",
              size: 5,
            },
            aggs: {
              top_products: {
                top_hits: {
                  size: 4,
                  _source: {
                    includes: [
                      "title",
                      "price",
                      "images",
                      "category",
                      "brand",
                      "isFeatured",
                      "rating",
                      "numReviews",
                      "discountPercentage",
                    ],
                  },
                },
              },
            },
          },
        },
      },
    });

    const recommendations = result.aggregations.trending_categories.buckets.map(
      (bucket) => ({
        category: bucket.key,
        products: bucket.top_products.hits.hits.map((hit) => ({
          _id: hit._id,
          ...hit._source,
        })),
      }),
    );

    if (req.logMeta) req.logMeta.search_engine = "elasticsearch";

    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error(`Recommendations Error: ${error.message}`);
    res.status(500).json({ success: false, error: "Recommendations failed" });
  }
};

exports.clearProductCache = clearProductCache;
exports.syncToElastic = syncToElastic;
