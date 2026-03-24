import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Store all chats
const chats = new Map();

// Create new session
app.get("/session", (req, res) => {
  const sessionId = crypto.randomUUID();

  chats.set(sessionId, [
    {
      role: "system",
      content: "LOL1"
    }
  ]);

  res.json({ sessionId });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ reply: "Missing message or sessionId" });
    }

    const chatHistory = chats.get(sessionId);

    if (!chatHistory) {
      return res.status(400).json({ reply: "Invalid session" });
    }

    // Add user message
    chatHistory.push({
      role: "user",
      content: message
    });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROK_API}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        input: chatHistory
      })
    });

    const data = await response.json();

    const reply =
      data.output?.[0]?.content?.[0]?.text || "No response from AI";

    // Save AI reply
    chatHistory.push({
      role: "assistant",
      content: reply
    });

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Error talking to AI" });
  }
});

// Reset chat
app.post("/reset", (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId || !chats.has(sessionId)) {
    return res.status(400).json({ success: false });
  }

  chats.set(sessionId, [
    {
      role: "system",
      content: "LOL2"
    }
  ]);

  res.json({ success: true });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});