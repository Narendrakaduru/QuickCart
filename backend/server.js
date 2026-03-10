const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Load env vars
dotenv.config({ path: path.join(__dirname, ".env") });

// Connect to database
connectDB();

// Connect to Redis
const { connectRedis } = require('./config/redis');
connectRedis();

// Connect to Elasticsearch
const { connectElastic } = require('./config/elastic');
const syncProductsToElastic = require('./utils/elasticSync');
connectElastic().then(() => {
  syncProductsToElastic();
});

// Initialize Cron Jobs (skip in test to prevent open handles)
if (process.env.NODE_ENV !== "test") {
  const abandonedCartJob = require("./cronJobs/abandonedCartJob");
  const inventoryLockJob = require("./cronJobs/inventoryLockJob");
  abandonedCartJob();
  inventoryLockJob();
}

const app = express();
app.set('trust proxy', true);
const logger = require('./config/logger');

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Rate Limiting
const { globalLimiter, authLimiter, orderLimiter } = require('./middleware/rateLimit');
app.use('/api', globalLimiter);

// Logstash Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  req.logMeta = {}; // For controllers to inject metadata

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      message: `${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      status_code: res.statusCode,
      response_time: duration,
      ...req.logMeta,
      timestamp: new Date().toISOString()
    });
  });
  next();
});

// Mount routers
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/addresses", require("./routes/addressRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// Make uploads folder static
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, console.log(`Server running on port ${PORT}`));
}

module.exports = app;
