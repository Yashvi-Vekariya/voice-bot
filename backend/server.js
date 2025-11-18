require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createChatCompletion } = require("./groqClient");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health Check
app.get("/", (req, res) => res.send("Voice-bot backend running"));

app.post("/api/chat", async (req, res) => {
  try {
    const { userText } = req.body;
    if (!userText)
      return res.status(400).json({ error: "userText is required" });

    // Special commands EXACT output (required by the company)
    const specialCommands = {
      "thanks": "Thanks",
      "👍": "👍",
      "i'm not sure": "I'm not sure",
      "im not sure": "I'm not sure"
    };

    const cleanInput = userText.trim().toLowerCase();
    if (specialCommands[cleanInput]) {
      return res.json({ text: specialCommands[cleanInput] });
    }

    // Strong & clean system message (interview-quality)
    const systemMessage = {
      role: "system",
      content: `
You are Yashvi Vekariya — an AI Engineer.

Rules:
• ALWAYS answer in fluent, professional ENGLISH only.
• NO Hindi. NO Hinglish. NO translation of sentences.
• Tone: confident, warm, friendly.
• Include slight Gujarati warmth (ONE short phrase only IF relevant).
• Structure answers in 2–4 clear short paragraphs or bullet points.
• DO NOT repeat sentences.
• For behavioural questions — include one example from Yashvi's RAG/Agents/AI projects.
• If user sends: "Thanks" → reply only: Thanks
• If user sends: "👍" → reply only: 👍
• If user sends: "I'm not sure" → reply only: I'm not sure
      `
    };

    const messages = [
      systemMessage,
      { role: "user", content: userText }
    ];

    // Groq API call
    const reply = await createChatCompletion({
      model: "llama-3.1-8b-instant",
      messages,
      max_tokens: 300,
      temperature: 0.3
    });

    const text =
      reply?.choices?.[0]?.message?.content ||
      reply?.choices?.[0]?.text ||
      reply?.text ||
      "No response";

    res.json({ text });

  } catch (err) {
    console.error("🔥 Backend error:", err?.response?.data || err);
    res.status(500).json({
      error: "Server error",
      details: err?.response?.data || err?.message
    });
  }
});

app.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
