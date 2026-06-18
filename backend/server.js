/**
 * FitStudent – Express.js Backend
 * Entry point: sets up middleware, routes, and starts the server.
 */

require("dotenv").config();

console.log(process.env.GROQ_API_KEY);

const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");
const path      = require("path");

const planRouter   = require("./routes/plan");
const healthRouter = require("./routes/health");
const { limiter }  = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Security & logging ────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,   // frontend served from same origin
  crossOriginEmbedderPolicy: false,
}));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── CORS ──────────────────────────────────────────────────────────────────

app.use(cors({
  origin: true,
  credentials: true
}));


// const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
//   .split(",")
//   .map(o => o.trim())
//   .filter(Boolean);

// app.use(cors({
//   origin: (origin, cb) => {
//     // allow same-origin requests (no Origin header) and listed origins
//     if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
//     cb(new Error(`CORS: origin ${origin} not allowed`));
//   },
//   methods: ["GET", "POST"],
//   allowedHeaders: ["Content-Type"],
// }));

// ─── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Serve static frontend ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../frontend/public")));

// ─── Rate limiter (applied to API routes only) ─────────────────────────────
app.use("/api", limiter);

// ─── Routes ────────────────────────────────────────────────────────────────
app.use("/api/health", healthRouter);
app.use("/api/plan",   planRouter);

// ─── SPA fallback – serve index.html for all non-API routes ───────────────
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

// ─── Global error handler ──────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  FitStudent server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
  console.log(`API key set : ${!!process.env.GROQ_API_KEY}`);
});

module.exports = app;
