# FitStudent — AI Workout & Diet Planner

> Personalised workout routines and meal plans for students — budget-aware, culturally relevant, and powered by Claude AI.

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | HTML5, CSS3, Vanilla JS (no frameworks) |
| Backend  | Node.js + Express.js                    |
| AI       | Anthropic Claude (`claude-sonnet-4-6`)  |
| Security | Helmet, CORS, express-rate-limit        |

---

## Project Structure

```
fitstudent/
├── backend/
│   ├── server.js                  ← Express entry point
│   ├── package.json
│   ├── .env.example               ← Copy to .env and fill in
│   ├── routes/
│   │   ├── plan.js                ← POST /api/plan/generate
│   │   └── health.js              ← GET  /api/health
│   ├── services/
│   │   └── aiService.js           ← Anthropic SDK wrapper
│   ├── middleware/
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   └── utils/
│       └── validators.js          ← Input sanitisation & validation
└── frontend/
    └── public/
        ├── index.html
        ├── css/style.css
        └── js/app.js
```

---

## Quick Start

### 1. Clone or unzip the project

```bash
cd fitstudent
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Set up your environment

```bash
cp .env.example .env
# Open .env and set your ANTHROPIC_API_KEY
```

Get an API key at https://console.anthropic.com

### 4. Run the server

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

### 5. Open the app

Visit **http://localhost:3000** in your browser.

---

## API Reference

### `GET /api/health`
Returns server and API key status.

```json
{
  "status": "ok",
  "service": "FitStudent API",
  "apiKeySet": true
}
```

---

### `POST /api/plan/generate`
Generates all three plan sections in parallel.

**Request body:**
```json
{
  "age": 20,
  "height": 170,
  "weight": 65,
  "gender": "Male",
  "activityLevel": "light",
  "healthConditions": "none",
  "equipment": "no equipment / bodyweight",
  "daysPerWeek": 3,
  "sessionDuration": 30,
  "timeOfDay": "morning",
  "goals": "lose weight, improve stamina",
  "timeline": "4 weeks",
  "dietType": "vegetarian",
  "cuisinePreference": "Indian, budget street food",
  "allergies": "none",
  "budget": "under ₹100/day (hostel/mess)",
  "livingSituation": "college hostel with mess"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workout": "### Day 1: Full Body...",
    "diet":    "### Day 1...",
    "tips":    "### Study–Workout Balance..."
  },
  "meta": {
    "generatedAt": "2026-06-18T10:00:00.000Z",
    "profile": { "age": 20, "goals": "lose weight", ... }
  }
}
```

---

### `POST /api/plan/generate/:section`
Regenerates a single section. `:section` = `workout` | `diet` | `tips`.

Same request body as above. Returns:
```json
{
  "success": true,
  "data": { "workout": "..." }
}
```

---

## Environment Variables

| Variable                | Default      | Description                         |
|-------------------------|--------------|-------------------------------------|
| `ANTHROPIC_API_KEY`     | *(required)* | Your Anthropic API key              |
| `PORT`                  | `3000`       | HTTP port                           |
| `NODE_ENV`              | `development`| `production` silences stack traces  |
| `ALLOWED_ORIGINS`       | `""`         | Comma-separated CORS origins        |
| `RATE_LIMIT_WINDOW_MS`  | `900000`     | Rate limit window (15 min)          |
| `RATE_LIMIT_MAX`        | `30`         | Max requests per window per IP      |

---

## Features

- **3-step onboarding** — profile → goals → diet preferences
- **Chip-based multi-select** for equipment, goals, cuisines
- **Indian-first diet plans** tuned to hostel budgets (₹100–₹400/day)
- **Parallel AI generation** — all 3 sections fetched concurrently
- **Regenerate** any single section without re-entering the form
- **Print / Save PDF** from the results screen
- **Rate limiting** — 30 requests per 15 min per IP
- **Input validation** on the server with detailed error messages
- **Health endpoint** for monitoring / uptime checks

---

## Deployment

### Render / Railway / Fly.io
1. Set `ANTHROPIC_API_KEY` as an environment variable in the dashboard.
2. Set start command to `npm start` (runs `node backend/server.js`).
3. The Express server serves the frontend from `frontend/public/`.

### Vercel (serverless)
Not recommended — the server uses persistent `Express` rather than serverless functions.

---

## Author

**Mohd Nadeem Ali Ansari**  
BCA Graduate · Data Analytics & Web Development  
[GitHub](https://github.com/mohdnadeemaliansari) · [LinkedIn](https://linkedin.com/in/mohd-nadeem-ali-ansari-/)
