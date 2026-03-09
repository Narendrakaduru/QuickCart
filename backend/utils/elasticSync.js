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
            title: { type: 'text' },
            description: { type: 'text' },
            category: { type: 'keyword' },
            brand: { type: 'keyword' },
            price: { type: 'float' },
            isFeatured: { type: 'boolean' }
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
        isFeatured: doc.isFeatured
      }
    ]);

    const bulkResponse = await elasticClient.bulk({ refresh: true, operations });

    if (bulkResponse.errors) {
      console.error('Errors occurred during Elasticsearch bulk sync');
    } else {
      console.log(`Products Synced to Elasticsearch: ${products.length} items`);
    }

  } catch (error) {
    console.error(`Elasticsearch Sync Error: ${error.message}`);
  }
};

module.exports = syncProductsToElastic;
