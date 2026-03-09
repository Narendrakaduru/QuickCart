const { Client } = require('@elastic/elasticsearch');

const elasticClient = new Client({
  node: process.env.ELASTIC_URL || 'http://localhost:9200',
  headers: {
    'Accept': 'application/vnd.elasticsearch+json; compatible-with=8',
    'Content-Type': 'application/vnd.elasticsearch+json; compatible-with=8'
  }
});

const connectElastic = async () => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    const health = await elasticClient.cluster.health();
    console.log(`Elasticsearch Connected: ${health.status}`);
  } catch (error) {
    console.error(`Error connecting to Elasticsearch: ${error.message}`);
  }
};

module.exports = { elasticClient, connectElastic };
