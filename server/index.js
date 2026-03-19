import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// 🔥 Main API
app.post("/api/summarize", async (req, res) => {
  const text = req.body?.text?.trim();

  // ✅ Improved validation
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Valid text is required" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
Return ONLY raw JSON (no markdown, no backticks):

{
 "summary": "one sentence",
 "keyPoints": ["point 1", "point 2", "point 3"],
 "sentiment": "positive | neutral | negative"
}

Text:
${text}
          `,
        },
      ],
    });

    let output = response?.choices?.[0]?.message?.content;

    // ✅ Clean markdown if present
    output = output.replace(/```json/g, "").replace(/```/g, "").trim();

    console.log("RAW OUTPUT:", output);

    let parsed;

    try {
      parsed = JSON.parse(output);
    } catch {
      return res.status(500).json({ error: "Invalid JSON from AI" });
    }

    res.json(parsed);
  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).json({ error: "Failed to summarize" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});