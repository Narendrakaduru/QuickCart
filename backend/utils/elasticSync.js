const { elasticClient } = require('../config/elastic');
const Product = require('../models/Product');

const syncProductsToElastic = async () => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    const indexName = 'products';

    // Check if index exists
    const indexExists = await elasticClient.indices.exists({ index: indexName });

    if (indexExists) {
      await elasticClient.indices.delete({ index: indexName });
    }

    // Create index with modern mappings
    await elasticClient.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            title: {
              type: 'text',
              fields: {
                suggest: {
                  type: 'search_as_you_type'
                }
              }
            },
            description: { type: 'text' },
            category: { type: 'keyword' },
            brand: { type: 'keyword' },
            price: { type: 'float' },
            isFeatured: { type: 'boolean' },
            rating: { type: 'float' },
            numReviews: { type: 'integer' },
            discountPercentage: { type: 'float' }
          }
        }
      }
    });

    const products = await Product.find({});
    
    if (products.length === 0) {
      console.log('No products to sync to Elasticsearch');
      return;
    }

    const operations = products.flatMap(doc => [
      { index: { _index: indexName, _id: doc._id.toString() } },
      { 
        title: doc.title,
        description: doc.description,
        category: doc.category,
        brand: doc.brand,
        price: doc.price,
        isFeatured: doc.isFeatured,
        images: doc.images,
        rating: doc.rating,
        numReviews: doc.numReviews,
        discountPercentage: doc.discountPercentage
      }
    ]);

    const bulkResponse = await elasticClient.bulk({ refresh: true, operations });

    if (bulkResponse.errors) {
      console.error('Errors occurred during Elasticsearch bulk sync');
    } else {
      console.log(`Products Synced to Elasticsearch: ${products.length} items`);
    }

  } catch (error) {
    console.error('Elasticsearch Sync Error:', error);
  }
};

module.exports = syncProductsToElastic;
