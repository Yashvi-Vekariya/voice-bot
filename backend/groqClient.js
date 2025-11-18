// groqClient.js
const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.warn("⚠️ Warning: GROQ_API_KEY is missing!");
}

const instance = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GROQ_API_KEY}`,
    "X-Groq-Region": "us-east-1" // 🔥 Prevent Mumbai region 500 HTML errors
  },
  timeout: 30000
});

async function createChatCompletion({
  model = "llama-3.1-8b-instant",   // 🔥 Correct model
  messages = [],
  max_tokens = 512,
  temperature = 0.2
}) {
  const body = {
    model,
    messages,
    max_tokens,       // 🔥 correct property (no max_output_tokens)
    temperature
  };

  const res = await instance.post("/chat/completions", body);
  return res.data;
}

module.exports = { createChatCompletion };
