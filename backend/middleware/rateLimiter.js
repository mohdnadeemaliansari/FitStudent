/**
 * middleware/rateLimiter.js
 * Limits API requests per IP to prevent abuse.
 */

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 min
  max:      parseInt(process.env.RATE_LIMIT_MAX, 10) || 30,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error:   "Too many requests from this IP. Please try again in a few minutes.",
  },
  skip: (req) => process.env.NODE_ENV === "test",
});

module.exports = { limiter };
