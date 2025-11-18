import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Assuming you still need your DB connection
import itemRoutes from "./routes/itemRoutes.js"; // Assuming you still use this route
import uploadRoute from "./routes/uploadRoutes.js"; // Correct path to your upload routes
import { v2 as cloudinary } from "cloudinary"; // Cloudinary import (already configured globally)

// Load environment variables
dotenv.config();

// Configure Cloudinary globally
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize database connection (if applicable)
connectDB();

const app = express();

// --- 🌐 CORS Configuration ---
// This is the correct and robust way to handle CORS.
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'; 
console.log("Allowed CORS origin:", allowedOrigin);

app.use(cors({
  origin: allowedOrigin,   
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include OPTIONS for preflight requests
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// --- Middleware ---
app.use(express.json()); // Body parser for JSON payloads

// --- Routes ---
app.use("/api/items", itemRoutes); 
app.use("/api/upload", uploadRoute);

// Test route
app.get("/", (req, res) => {
  res.send("Throw-A-Fit API is running.");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});