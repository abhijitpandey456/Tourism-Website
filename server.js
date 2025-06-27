require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 5000;

// ────── Middleware ──────
app.use(cors());
app.use(bodyParser.json());

// ────── MongoDB Connection ──────
mongoose.connect("mongodb://127.0.0.1:27017/tourism", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ────── Mongoose User Schema ──────
const userSchema = new mongoose.Schema({
  name: String,
  number: String,
  email: String,
  password: String
});
const User = mongoose.model("User", userSchema);

// ────── Sign-In Route ──────
app.post("/signin", async (req, res) => {
  try {
    const { name, number, email, password } = req.body;
    const user = new User({ name, number, email, password });
    await user.save();
    res.status(200).send("✅ Sign-in successful!");
  } catch (err) {
    console.error("❌ Sign-in error:", err);
    res.status(500).send("❌ Server error");
  }
});

// ────── Gemini AI Setup ──────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ────── AI Route ──────
app.post("/ask-ai", async (req, res) => {
  const message = req.body.message;
  if (!message) return res.status(400).json({ reply: "No message provided" });

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ reply: "AI failed to respond." });
  }
});

// ────── Start Server ──────
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
