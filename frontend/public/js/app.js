/**
 * FitStudent – Frontend App (app.js)
 *
 * Responsibilities:
 *  - Multi-step form navigation
 *  - Chip toggle logic
 *  - Profile data collection
 *  - POST to /api/plan/generate (Node/Express backend)
 *  - Render AI results with markdown-to-HTML conversion
 *  - Regenerate individual sections via /api/plan/generate/:section
 */

"use strict";

// ── State ────────────────────────────────────────────────────────────────────
const state = {
  currentStep: 0,
  currentTab:  "workout",
  plan: { workout: "", diet: "", tips: "" },
  profile: null,
};

// ── DOM refs ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initChips();
  initSliders();
  checkApiHealth();
});

// ── API health check ──────────────────────────────────────────────────────────
async function checkApiHealth() {
  const dot = document.querySelector(".status-dot");
  const txt = document.querySelector(".status-txt");
  try {
    const res  = await fetch("/api/health");
    const data = await res.json();
    if (data.status === "ok" && data.apiKeySet) {
      dot.classList.add("ok");
      txt.textContent = "AI ready";
    } else {
      dot.classList.add("err");
      txt.textContent = data.apiKeySet ? "API online" : "API key missing";
    }
  } catch {
    dot.classList.add("err");
    txt.textContent = "Server offline";
  }
}

// ── Step navigation ───────────────────────────────────────────────────────────
function goStep(n) {
  $(`step${state.currentStep}`).classList.add("hidden");
  $(`step${n}`).classList.remove("hidden");
  state.currentStep = n;
  updateStepProgress(n);
  window.scrollTo({ top: $("plannerSection").offsetTop - 80, behavior: "smooth" });
}

function updateStepProgress(n) {
  document.querySelectorAll(".sp-step").forEach((el, i) => {
    el.classList.toggle("active", i === n);
    el.classList.toggle("done",   i < n);
  });
  document.querySelectorAll(".sp-line").forEach((el, i) => {
    el.classList.toggle("done", i < n);
  });
}

// ── Chip toggling ─────────────────────────────────────────────────────────────
function initChips() {
  document.querySelectorAll(".chip-group").forEach(group => {
    const isMulti = group.dataset.multi === "true";
    group.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        if (!isMulti) {
          group.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
        }
        chip.classList.toggle("active");
        // Ensure at least one chip stays active for single-select
        if (!isMulti) {
          const hasActive = [...group.querySelectorAll(".chip")].some(c => c.classList.contains("active"));
          if (!hasActive) chip.classList.add("active");
        }
      });
    });
  });
}

function getChipVals(groupId) {
  const vals = [...document.querySelectorAll(`#${groupId} .chip.active`)]
    .map(c => c.dataset.val);
  return vals.length ? vals.join(", ") : "any";
}

// ── Sliders ───────────────────────────────────────────────────────────────────
function initSliders() {
  const days = $("daysPerWeek");
  const dayL = $("daysLive");
  days.addEventListener("input", () => {
    dayL.textContent = `${days.value} day${days.value > 1 ? "s" : ""}`;
  });

  const dur = $("sessionDuration");
  const durL = $("durLive");
  dur.addEventListener("input", () => {
    durL.textContent = `${dur.value} min`;
  });
}

// ── Build profile object ──────────────────────────────────────────────────────
function buildProfile() {
  return {
    age:              parseInt($("age").value, 10),
    height:           parseInt($("height").value, 10),
    weight:           parseInt($("weight").value, 10),
    gender:           $("gender").value,
    activityLevel:    $("activityLevel").value,
    healthConditions: $("healthConditions").value.trim() || "",
    equipment:        getChipVals("equipChips"),
    daysPerWeek:      parseInt($("daysPerWeek").value, 10),
    sessionDuration:  parseInt($("sessionDuration").value, 10),
    timeOfDay:        getChipVals("timeOfDayChips"),
    goals:            getChipVals("goalChips"),
    timeline:         getChipVals("timelineChips"),
    dietType:         getChipVals("dietChips"),
    cuisinePreference:getChipVals("cuisineChips"),
    allergies:        $("allergies").value.trim() || "",
    budget:           getChipVals("budgetChips"),
    livingSituation:  getChipVals("livingChips"),
  };
}

// ── Loading overlay ───────────────────────────────────────────────────────────
const LOAD_MSGS = [
  "Analysing your profile…",
  "Building your workout schedule…",
  "Planning budget-friendly meals…",
  "Adding personal touches…",
  "Almost there…",
];
let loadCycle, loadIdx = 0;

function showLoading(msg) {
  $("loMsg").textContent = msg || LOAD_MSGS[0];
  $("loadingOverlay").classList.remove("hidden");
  loadIdx = 1;
  loadCycle = setInterval(() => {
    $("loMsg").textContent = LOAD_MSGS[loadIdx % LOAD_MSGS.length];
    loadIdx++;
  }, 2500);
}

function hideLoading() {
  clearInterval(loadCycle);
  $("loadingOverlay").classList.add("hidden");
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, isError = false) {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast" + (isError ? " error" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 4000);
}

// ── Generate full plan ────────────────────────────────────────────────────────
async function generatePlan() {
  const profile = buildProfile();
  state.profile  = profile;

  showLoading();

  try {
    const res = await fetch("/api/plan/generate", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(profile),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || "Something went wrong. Please try again.");
    }

    state.plan = json.data;
    hideLoading();
    renderResults(profile);
    showToast("Your personalised plan is ready!");

  } catch (err) {
    hideLoading();
    showToast(err.message || "Failed to generate plan. Check your connection.", true);
    console.error("Generate error:", err);
  }
}

// ── Regenerate one section ────────────────────────────────────────────────────
async function regenSection() {
  const section = state.currentTab;
  if (!state.profile) return;

  showLoading(`Regenerating ${section} plan…`);

  try {
    const res = await fetch(`/api/plan/generate/${section}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(state.profile),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || "Regeneration failed.");
    }

    state.plan[section] = json.data[section];
    hideLoading();
    showTab(section);
    showToast(`${capitalize(section)} plan regenerated!`);

  } catch (err) {
    hideLoading();
    showToast(err.message, true);
  }
}

// ── Render results ────────────────────────────────────────────────────────────
function renderResults(profile) {
  // Scroll to results
  $("resultsSection").classList.remove("hidden");
  $("resultsSection").scrollIntoView({ behavior: "smooth", block: "start" });

  // Profile badges
  $("profileBadges").innerHTML = [
    { icon: "ti-user",          val: `${profile.age} yrs · ${profile.weight} kg` },
    { icon: "ti-target",        val: profile.goals.split(",")[0].trim() },
    { icon: "ti-calendar",      val: `${profile.daysPerWeek}×/week` },
    { icon: "ti-clock",         val: `${profile.sessionDuration} min sessions` },
    { icon: "ti-currency-rupee",val: profile.budget.split(",")[0].trim() },
    { icon: "ti-home",          val: profile.livingSituation.split(",")[0].trim() },
  ].map(b => `
    <div class="pbadge">
      <i class="ti ${b.icon}" aria-hidden="true"></i>${b.val}
    </div>
  `).join("");

  showTab("workout");
}

// ── Tab switching ─────────────────────────────────────────────────────────────
function showTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll(".rtab").forEach(btn => {
    btn.classList.toggle("active", btn.id === `tab-${tab}`);
    btn.setAttribute("aria-selected", btn.id === `tab-${tab}`);
  });
  $("resultPanel").innerHTML = mdToHtml(state.plan[tab]) ||
    `<p style="color:#8fa3c0">No content available. Try regenerating.</p>`;
}

// ── Edit profile ──────────────────────────────────────────────────────────────
function editPlan() {
  $("resultsSection").classList.add("hidden");
  goStep(0);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Scroll to form ────────────────────────────────────────────────────────────
function scrollToForm() {
  $("plannerSection").scrollIntoView({ behavior: "smooth" });
}

// ── Markdown → HTML (lightweight) ────────────────────────────────────────────
function mdToHtml(md) {
  if (!md) return "";
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/###\s*(.+)/g, "<h3>$1</h3>")
    .replace(/##\s*(.+)/g,  "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^[\-\*]\s+(.+)/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, m => "<ul>" + m + "</ul>")
    .replace(/<\/ul>\s*<ul>/g, "")
    .replace(/\n{2,}/g, "<br>")
    .replace(/\n/g, " ");
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
