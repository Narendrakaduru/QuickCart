const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisClient } = require('../config/redis');

const makeStore = () => {
  if (process.env.NODE_ENV === 'test' || !redisClient.isReady) return undefined;
  return new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) });
};

// Global limiter — applied to all /api/* routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: { success: false, error: 'Too many requests, please try again later.' },
});

// Auth limiter — login & register only
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: { success: false, error: 'Too many auth attempts, please try again in 15 minutes.' },
});

// Order limiter — prevent order spam
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: { success: false, error: 'Too many orders placed. Please wait before trying again.' },
});

module.exports = { globalLimiter, authLimiter, orderLimiter };
