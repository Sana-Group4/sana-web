import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors()); // allow frontend to connect

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("", {
      method: "POST",
      headers: {
        "Authorization": `Bearer YOUR_API_KEY`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: userMessage
      })
    });

    const data = await response.json();

    const reply =
      data.output?.[0]?.content?.[0]?.text || "No response from AI";

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.json({ reply: "Error talking to AI" });
  }
});

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);