const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function callAI(prompt) {
  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

async function generateWorkoutPlan(profile) {
  return callAI(`Create a personalized workout plan for:
Age: ${profile.age}
Weight: ${profile.weight}
Goals: ${profile.goals}`);
}

async function generateDietPlan(profile) {
  return callAI(`Create a 7-day diet plan for:
Age: ${profile.age}
Weight: ${profile.weight}
Goals: ${profile.goals}`);
}

async function generateWellnessTips(profile) {
  return callAI(`Give wellness tips for:
Age: ${profile.age}
Goals: ${profile.goals}`);
}

module.exports = {
  generateWorkoutPlan,
  generateDietPlan,
  generateWellnessTips,
};