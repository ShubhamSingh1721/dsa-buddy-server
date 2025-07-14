require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate-hint", async (req, res) => {
  const { title, level } = req.body;

  const prompt = `Give a ${level}-level hint (not a solution) for the DSA problem titled: ${title}`;

  try {
    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
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
    res.json({ hint: data.generations?.[0]?.text?.trim() || "" });

  } catch (err) {
    res.status(500).json({ error: "Error generating hint" });
  }
});

app.get("/", (req, res) => {
  res.send("🧠 DSA Buddy Hint API is running.");
});


app.listen(3000, () => console.log("Server running on port 3000"));
