/**
 * middleware/errorHandler.js
 * Centralised Express error handler.
 * Converts known Anthropic SDK errors into helpful HTTP responses.
 */

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isDev = process.env.NODE_ENV !== "production";

  // Log to console always
  console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.path}:`, err.message);
  if (isDev) console.error(err.stack);

  // ── Anthropic API errors ───────────────────────────────────────────────
  if (err.name === "AuthenticationError" || err.status === 401) {
    return res.status(502).json({
      success: false,
      error:   "AI service authentication failed. Please check your API key.",
    });
  }

  if (err.name === "RateLimitError" || err.status === 429) {
    return res.status(429).json({
      success: false,
      error:   "AI service rate limit reached. Please wait a moment and try again.",
    });
  }

  if (err.name === "APIConnectionError" || err.code === "ECONNREFUSED") {
    return res.status(503).json({
      success: false,
      error:   "Could not reach the AI service. Please check your connection.",
    });
  }

  if (err.status === 400) {
    return res.status(400).json({
      success: false,
      error:   err.message || "Bad request.",
    });
  }

  // ── CORS error ─────────────────────────────────────────────────────────
  if (err.message && err.message.startsWith("CORS:")) {
    return res.status(403).json({ success: false, error: err.message });
  }

  // ── Generic fallback ───────────────────────────────────────────────────
  res.status(500).json({
    success: false,
    error:   isDev ? err.message : "Something went wrong on the server. Please try again.",
  });
}

module.exports = errorHandler;
