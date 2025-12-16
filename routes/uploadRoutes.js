import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import Item from "../models/Item.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const VALID_CATEGORIES = ["tops", "bottoms", "shoes", "accessories"];

router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  console.log("DEBUG: req.user:", req.user);

  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ message: "❌ No file received." });
  }

  const { name, category, color, pattern, style } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: "❌ Missing item name or category." });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: "❌ Invalid category value." });
  }

  try {
    /* ---------------- REMOVE BACKGROUND ---------------- */

    const removeBgApiResult = await axios({
      method: "post",
      url: "https://api.remove.bg/v1.0/removebg",
      headers: { "X-Api-Key": process.env.REMOVE_BG_API_KEY },
      data: {
        image_file_b64: req.file.buffer.toString("base64"),
        size: "auto",
        type: "product",
      },
      responseType: "arraybuffer",
    });

    const processedImageBase64 = Buffer.from(removeBgApiResult.data).toString("base64");
    const dataUri = `data:image/png;base64,${processedImageBase64}`;

    /* ---------------- CLOUDINARY ---------------- */

    const cloudinaryResult = await cloudinary.uploader.upload(dataUri, {
      folder: "ThrowAFit",
      format: "png",
    });

    const imageUrl = cloudinaryResult.secure_url;

    /* ---------------- SAVE ITEM ---------------- */

    const newItem = await Item.create({
      name,
      category,
      color: color || null,
      pattern: pattern || null,
      style: style || null,
      imageUrl,
      user: req.user.id,
    });

    res.status(201).json({
      message: "✅ Item created and image processed successfully!",
      item: newItem,
    });

  } catch (error) {
    console.error("Upload Error:", error.message);

    if (error.response?.data) {
      const apiError = Buffer.from(error.response.data).toString("utf8");
      console.error("remove.bg Error:", apiError);
      return res.status(error.response.status || 500).json({
        message: `❌ API Error: ${apiError.slice(0, 100)}...`,
      });
    }

    res.status(500).json({ message: "❌ Failed to upload item." });
  }
});

export default router;
