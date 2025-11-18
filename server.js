import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { v2 as cloudinary } from "cloudinary";

// 1. Load environment variables
dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);

// 2. Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 3. Connect to MongoDB
connectDB();

const app = express();

// ---------------------
// 🔐 CORS CONFIG
// ---------------------

const corsOptions = {
  origin: [
    "https://serene-eclair-9ae22f.netlify.app", // your deployed frontend
    "http://localhost:5173",                   // local development
  ],
  credentials: true,
};

app.use(cors(corsOptions));

// ---------------------
// ⚠️ IMPORTANT: DO NOT put express.json() here
// It breaks multipart/form-data uploads
// ---------------------

// ---------------------
// 📌 ROUTES
// ---------------------
app.use("/api/items", itemRoutes);
app.use("/api/upload", uploadRoutes);

// Only parse JSON AFTER routes that handle file uploads
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Throw-A-Fit API is running");
});

// ---------------------
// 🚀 START SERVER
// ---------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
