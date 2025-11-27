import express from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

const router = express.Router();

// -------- SIGNUP --------
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ msg: "Username already taken" });

  const hashed = await bcrypt.hash(password, 10);

  await User.create({ username, password: hashed });

  res.json({ msg: "Account created" });
});

// -------- LOGIN --------
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ msg: "Incorrect password" });

  res.json({ msg: "Login success" });
});

export default router;
