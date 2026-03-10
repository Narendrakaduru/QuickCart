require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const syncProductsToElastic = require("./utils/elasticSync");
const { connectElastic } = require("./config/elastic");

const run = async () => {
    try {
        await connectDB();
        await connectElastic();
        await syncProductsToElastic();
        console.log("Sync complete");
        process.exit(0);
    } catch (error) {
        console.error("Error during sync", error);
        process.exit(1);
    }
};

run();
