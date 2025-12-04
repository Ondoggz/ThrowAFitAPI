import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

// ─── Connect to Database ───
connectDB();

// ─── App Initialization ───
const app = express();

// ─── CORS Setup ───
const allowedOrigins = [process.env.CORS_ORIGIN, "http://localhost:3000"].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow Postman/curl
      if (allowedOrigins.includes(origin)) callback(null, true);
      else {
        console.error("CORS blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── Middleware ───
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Temporary Upload Folder ───
const TMP_DIR = path.join(".", "tmp");
import fs from "fs";
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// ─── Routes ───
app.use("/api/items", itemRoutes);
app.use("/api/upload", uploadRoutes); // Multer handled inside uploadRoutes
app.use("/api/auth", authRoutes);

// ─── Root Route ───
app.get("/", (req, res) => {
  res.send("Throw-A-Fit API is running.");
});

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.stack || err);
  res.status(500).json({ message: err.message || "Server error" });
});

// ─── Start Server ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
