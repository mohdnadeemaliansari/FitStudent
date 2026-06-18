/**
 * routes/health.js
 * GET /api/health  – simple liveness probe
 */

const express = require("express");
const router  = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status:    "ok",
    service:   "FitStudent API",
    version:   "1.0.0",
    timestamp: new Date().toISOString(),
    apiKeySet: !!process.env.GROQ_API_KEY,
  });
});

module.exports = router;
