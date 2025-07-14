require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const COHERE_API_KEY = process.env.COHERE_API_KEY;

if (!COHERE_API_KEY) {
  console.error("❌ ERROR: COHERE_API_KEY is missing in environment variables!");
  process.exit(1); // Stop the server if no API key
}

app.use(cors());
app.use(express.json());

app.post("/generate-hint", async (req, res) => {
  const { title, level } = req.body;

  if (!title || !level) {
    return res.status(400).json({ error: "Missing title or level" });
  }

  const prompt = `Give a ${level}-level hint (not a solution) for the DSA problem titled: ${title}`;

  try {
    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "command",
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.7,
        stop_sequences: []
      })
    });

    const data = await response.json();

    console.log("Cohere response:", JSON.stringify(data, null, 2));

    const hint = data.generations?.[0]?.text?.trim();

    if (!hint) {
      return res.status(500).json({ error: "No hint received from Cohere" });
    }

    res.json({ hint });
  } catch (err) {
    console.error("❌ Error calling Cohere:", err);
    res.status(500).json({ error: "Error generating hint", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("🧠 DSA Buddy Hint API is running.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
