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

// Initialize BullMQ Workers & Schedule repeatable jobs
if (process.env.NODE_ENV !== "test") {
  require("./workers/mainWorker");
  const systemQueue = require("./queues/systemQueue");

  // Schedule repeatable jobs
  // Every 1 minute (responsive) - Inventory Release
  systemQueue.add('inventory_release', {}, {
    repeat: { pattern: '* * * * *' }
  });

  // Every 5 minutes - Abandoned Cart
  systemQueue.add('abandoned_cart', {}, {
    repeat: { pattern: '*/5 * * * *' }
  });

  console.log('BullMQ workers activated and repeatable jobs scheduled.');
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
// Create v1 Api Router
const apiRouter = express.Router();

apiRouter.use("/auth", require("./routes/authRoutes"));
apiRouter.use("/users", require("./routes/userRoutes"));
apiRouter.use("/products", require("./routes/productRoutes"));
apiRouter.use("/cart", require("./routes/cartRoutes"));
apiRouter.use("/wishlist", require("./routes/wishlistRoutes"));
apiRouter.use("/orders", require("./routes/orderRoutes"));
apiRouter.use("/upload", require("./routes/uploadRoutes"));
apiRouter.use("/addresses", require("./routes/addressRoutes"));
apiRouter.use("/logs", require("./routes/logRoutes"));
apiRouter.use("/coupons", require("./routes/couponRoutes"));
apiRouter.use("/notifications", require("./routes/notificationRoutes"));
apiRouter.use("/analytics", require("./routes/analyticsRoutes"));
apiRouter.use("/payment", require("./routes/paymentRoutes"));

// Mount the apiRouter
app.use("/api/v1", apiRouter);

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
