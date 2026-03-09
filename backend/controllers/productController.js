const Product = require("../models/Product");
const { redisClient } = require("../config/redis");

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

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    if (redisClient.isReady) {
      const cacheKey = `products:${req.originalUrl}`;
      const cachedProducts = await redisClient.get(cacheKey);
      if (cachedProducts) {
        return res.status(200).json(JSON.parse(cachedProducts));
      }
    }

    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`,
    );

    // Finding resource
    query = Product.find(JSON.parse(queryStr));

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
    const total = await Product.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const products = await query.populate("user", "name email");

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    const responseData = {
      success: true,
      count: products.length,
      pagination,
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
        return res.status(200).json(JSON.parse(cachedProduct));
      }
    }

    const product = await Product.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const responseData = { success: true, data: product };
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
