const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const syncProductsToElastic = require('./utils/elasticSync');

const run = async () => {
  await connectDB();
  await syncProductsToElastic();
  console.log("Sync complete");
  process.exit(0);
};
run();
