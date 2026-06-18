/**
 * routes/plan.js
 *
 * POST /api/plan/generate
 *   Body: { profile } object
 *   Returns: { workout, diet, tips }
 *
 * POST /api/plan/generate/:section
 *   Regenerate a single section (workout | diet | tips)
 *   Body: { profile } object
 *   Returns: { [section]: string }
 */

const express  = require("express");
const router   = express.Router();
const { validateProfile }    = require("../utils/validators");
const {
  generateWorkoutPlan,
  generateDietPlan,
  generateWellnessTips,
} = require("../services/aiService");

// ── Helper: parse & validate profile from request body ────────────────────
function parseProfile(req, res) {
  const body = req.body;
  if (!body || typeof body !== "object") {
    res.status(400).json({ success: false, error: "Request body is required." });
    return null;
  }

  const { valid, data, errors } = validateProfile(body);
  if (!valid) {
    res.status(422).json({ success: false, error: "Validation failed.", details: errors });
    return null;
  }
  return data;
}

// ── POST /api/plan/generate  (full plan – all 3 sections in parallel) ──────
router.post("/generate", async (req, res, next) => {
  const profile = parseProfile(req, res);
  if (!profile) return;

  try {
    // Fire all three AI calls concurrently
    const [workout, diet, tips] = await Promise.all([
      generateWorkoutPlan(profile),
      generateDietPlan(profile),
      generateWellnessTips(profile),
    ]);

    res.status(200).json({
      success: true,
      data: { workout, diet, tips },
      meta: {
        generatedAt: new Date().toISOString(),
        profile: {
          age:      profile.age,
          goals:    profile.goals,
          timeline: profile.timeline,
          budget:   profile.budget,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/plan/generate/:section  (regenerate one section) ─────────────
router.post("/generate/:section", async (req, res, next) => {
  const { section } = req.params;
  const validSections = ["workout", "diet", "tips"];

  if (!validSections.includes(section)) {
    return res.status(400).json({
      success: false,
      error: `Invalid section. Must be one of: ${validSections.join(", ")}`,
    });
  }

  const profile = parseProfile(req, res);
  if (!profile) return;

  try {
    let result;
    if (section === "workout") result = await generateWorkoutPlan(profile);
    else if (section === "diet") result = await generateDietPlan(profile);
    else result = await generateWellnessTips(profile);

    res.status(200).json({
      success: true,
      data: { [section]: result },
      meta: { generatedAt: new Date().toISOString() },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
