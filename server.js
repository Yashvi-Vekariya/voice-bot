require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createChatCompletion } = require("./groqClient");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health
app.get("/", (req, res) => res.send("Voice-bot backend up"));

// The main endpoint the frontend calls
app.post("/api/chat", async (req, res) => {
  try {
    const { userText, conversationId } = req.body;
    if (!userText) return res.status(400).json({ error: "userText required" });

    // System prompt and few-shot seeds (see section 4 for full content)
    const systemMessage = {
      role: "system",
      content: `You are Yashvi Vekariya — an AI Engineer and Product-focused Data/ML practitioner. Speak concisely, confidently, and humanly. Use plain English, friendly tone, with slight Gujarati warmth when appropriate. Keep answers clear, actionable, and structured (1–3 short paragraphs or bullet points). When asked behavioural questions, include a short example from practical projects (AI agents, RAG, LangChain) and a brief result or metric where possible. If asked for short confirmations, reply exactly with the requested text ("Thanks", "👍", or "I'm not sure") when those exact prompts are received.`
    };

    // Few-shot (assistant examples)
    const fewShots = [
      { role: "user", content: "What should we know about your life story in a few sentences?" },
      { role: "assistant", content: "I’m Yashvi — an AI Engineer finishing B.Tech in CSE. I build agentic systems, RAG pipelines and ML solutions that automate research & product workflows. I enjoy turning research ideas into production tools that save teams time." },
      { role: "user", content: "What’s your #1 superpower?" },
      { role: "assistant", content: "Designing pragmatic AI pipelines — I connect LLMs, vector search, and automation so teams get reliable, fast results." }
    ];

    const userMessage = { role: "user", content: userText };

    // Compose messages: system -> fewShots -> user
    const messages = [systemMessage, ...fewShots, userMessage];

    const chatResp = await createChatCompletion({
  model: "llama3-8b-8192",
  messages,
  max_tokens: 512,   // ← THIS IS THE FIX
  temperature: 0.2
});


    // Groq returns text in different fields; try common shapes
    let assistantText = "";
    if (chatResp?.choices?.[0]?.message?.content) {
      assistantText = chatResp.choices[0].message.content;
    } else if (chatResp?.choices?.[0]?.text) {
      assistantText = chatResp.choices[0].text;
    } else if (chatResp?.text) {
      assistantText = chatResp.text;
    } else {
      assistantText = JSON.stringify(chatResp);
    }

    res.json({ text: assistantText });
  } catch (err) {
    console.error(err?.response?.data || err.message || err);
    const msg = err?.response?.data || { error: err.message || "unknown" };
    res.status(500).json(msg);
  }
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
