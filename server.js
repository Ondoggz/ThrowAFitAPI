import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoute from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();

// CORS (uses Render environment variable)
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/upload", uploadRoute);

app.get("/", (req, res) => {
  res.send("Server is running.");
});

const port = process.env.PORT || 10000;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
