/**
 * utils/validators.js
 * Validates and sanitises the profile payload before it reaches the AI service.
 */

const VALID_GENDERS     = ["Male", "Female", "Non-binary / prefer not to say"];
const VALID_ACTIVITY    = ["sedentary", "light", "moderate", "very"];
const VALID_TIMELINES   = ["4 weeks", "8 weeks", "3 months", "ongoing"];
const VALID_TIME_OF_DAY = ["morning", "afternoon", "evening", "flexible"];
const VALID_DIET_TYPES  = ["vegetarian", "non-vegetarian", "vegan", "eggetarian", "jain", "any / no restriction"];

/**
 * Returns { valid: true, data } or { valid: false, errors: [...] }
 */
function validateProfile(body) {
  const errors = [];

  // ── Numeric fields ────────────────────────────────────────────────────────
  const age    = parseInt(body.age, 10);
  const height = parseInt(body.height, 10);
  const weight = parseInt(body.weight, 10);
  const days   = parseInt(body.daysPerWeek, 10);
  const dur    = parseInt(body.sessionDuration, 10);

  if (isNaN(age)    || age < 15    || age > 35)    errors.push("age must be 15–35");
  if (isNaN(height) || height < 140 || height > 220) errors.push("height must be 140–220 cm");
  if (isNaN(weight) || weight < 35  || weight > 200) errors.push("weight must be 35–200 kg");
  if (isNaN(days)   || days < 1    || days > 7)    errors.push("daysPerWeek must be 1–7");
  if (isNaN(dur)    || dur < 15    || dur > 90)    errors.push("sessionDuration must be 15–90 min");

  // ── Enum fields ───────────────────────────────────────────────────────────
  if (!VALID_GENDERS.includes(body.gender))
    errors.push(`gender must be one of: ${VALID_GENDERS.join(", ")}`);

  if (!VALID_ACTIVITY.includes(body.activityLevel))
    errors.push(`activityLevel must be one of: ${VALID_ACTIVITY.join(", ")}`);

  if (!VALID_TIMELINES.includes(body.timeline))
    errors.push(`timeline must be one of: ${VALID_TIMELINES.join(", ")}`);

  if (!VALID_TIME_OF_DAY.includes(body.timeOfDay))
    errors.push(`timeOfDay must be one of: ${VALID_TIME_OF_DAY.join(", ")}`);

  if (!VALID_DIET_TYPES.includes(body.dietType))
    errors.push(`dietType must be one of: ${VALID_DIET_TYPES.join(", ")}`);

  // ── String fields (non-empty required) ────────────────────────────────────
  if (!body.goals || typeof body.goals !== "string" || body.goals.trim().length < 3)
    errors.push("goals is required");

  if (!body.equipment || typeof body.equipment !== "string")
    errors.push("equipment is required");

  if (!body.budget || typeof body.budget !== "string")
    errors.push("budget is required");

  if (!body.livingSituation || typeof body.livingSituation !== "string")
    errors.push("livingSituation is required");

  if (!body.cuisinePreference || typeof body.cuisinePreference !== "string")
    errors.push("cuisinePreference is required");

  if (errors.length > 0) return { valid: false, errors };

  // ── Sanitised data object ─────────────────────────────────────────────────
  const data = {
    age,
    height,
    weight,
    gender:           body.gender.trim(),
    activityLevel:    body.activityLevel.trim(),
    healthConditions: sanitiseOptional(body.healthConditions),
    equipment:        body.equipment.trim(),
    daysPerWeek:      days,
    sessionDuration:  dur,
    timeOfDay:        body.timeOfDay.trim(),
    goals:            body.goals.trim(),
    timeline:         body.timeline.trim(),
    dietType:         body.dietType.trim(),
    cuisinePreference:body.cuisinePreference.trim(),
    allergies:        sanitiseOptional(body.allergies),
    budget:           body.budget.trim(),
    livingSituation:  body.livingSituation.trim(),
  };

  return { valid: true, data };
}

function sanitiseOptional(val) {
  if (!val || typeof val !== "string") return "none";
  const trimmed = val.trim().slice(0, 200); // cap length
  return trimmed || "none";
}

module.exports = { validateProfile };
