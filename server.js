import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { v2 as cloudinary } from "cloudinary";

// Load env FIRST
dotenv.config();

const app = express();

// ----------------------------
// 🔥 CORS MUST BE THE FIRST MIDDLEWARE
// ----------------------------
app.use(cors({
  origin: [
    "https://serene-eclair-9ae22f.netlify.app",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ----------------------------
// THEN connect Cloudinary/Mongo
// ----------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDB();

// ----------------------------
// DO NOT PUT express.json() HERE
// ----------------------------

// ----------------------------
// ROUTES
// ----------------------------
app.use("/api/items", itemRoutes);
app.use("/api/upload", uploadRoutes);

// JSON parser AFTER upload route
app.use(express.json());

// Root check
app.get("/", (req, res) => {
  res.send("Throw-A-Fit API is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
