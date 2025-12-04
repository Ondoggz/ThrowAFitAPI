import express from "express";
import { auth } from "./authRoutes.js";
import fs from "fs";
import path from "path";
import Item from "../models/Item.js";
import FormData from "form-data";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import { upload } from "../server.js"; // multer middleware

const router = express.Router();

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { name, category } = req.body;

    if (!name || !category) {
      // Delete temp file if input invalid
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Name and category are required" });
    }

    // --- Step 1: Send to remove.bg API ---
    const formData = new FormData();
    formData.append("image_file", fs.createReadStream(req.file.path));
    formData.append("size", "auto");

    const removeBgRes = await axios({
      method: "post",
      url: "https://api.remove.bg/v1.0/removebg",
      data: formData,
      headers: {
        ...formData.getHeaders(),
        "X-Api-Key": process.env.REMOVEBG_API_KEY,
      },
      responseType: "arraybuffer",
    });

    // --- Step 2: Save bg-removed image temporarily ---
    const tempPath = path.join(".", `uploads/temp-${Date.now()}.png`);
    fs.writeFileSync(tempPath, removeBgRes.data);

    // --- Step 3: Upload to Cloudinary ---
    const uploadResult = await cloudinary.uploader.upload(tempPath, {
      folder: "throw-a-fit",
      resource_type: "image",
    });

    // --- Step 4: Cleanup temp files ---
    fs.unlinkSync(req.file.path);
    fs.unlinkSync(tempPath);

    // --- Step 5: Save item to DB ---
    const newItem = new Item({
      name,
      category,
      imageUrl: uploadResult.secure_url,
      user: req.user._id,
    });

    await newItem.save();

    res.status(201).json({ message: "Upload successful", item: newItem });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    // Attempt to clean up temp files if they exist
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message || "Server error during upload" });
  }
});

export default router;
