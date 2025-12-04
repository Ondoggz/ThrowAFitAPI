import express from "express";
import { auth } from "./authRoutes.js";
import fs from "fs";
import path from "path";
import Item from "../models/Item.js";
import FormData from "form-data";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const router = express.Router();

// ─── TEMP UPLOAD FOLDER SETUP ───
const TMP_DIR = path.join(".", "tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// ─── MULTER SETUP ───
const storage = multer.diskStorage({
  destination: TMP_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// ─── UPLOAD ROUTE ───
router.post("/", auth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const { name, category } = req.body;
  if (!name || !category) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Name and category are required" });
  }

  try {
    // --- 1️⃣ Remove background via remove.bg ---
    const formData = new FormData();
    formData.append("image_file", fs.createReadStream(req.file.path));
    formData.append("size", "auto");

    let removeBgRes;
    try {
      removeBgRes = await axios({
        method: "post",
        url: "https://api.remove.bg/v1.0/removebg",
        data: formData,
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": process.env.REMOVEBG_API_KEY,
        },
        responseType: "arraybuffer",
      });
    } catch (err) {
      console.error("Remove.bg error:", err.response?.data || err.message);
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: "Failed to remove background" });
    }

    // --- 2️⃣ Save temporarily the bg-removed image ---
    const tempPath = path.join(TMP_DIR, `bg-removed-${Date.now()}.png`);
    fs.writeFileSync(tempPath, removeBgRes.data);

    // --- 3️⃣ Upload to Cloudinary ---
    const uploadResult = await cloudinary.uploader.upload(tempPath, {
      folder: "throw-a-fit",
      resource_type: "image",
    });

    // --- 4️⃣ Cleanup temp files ---
    fs.unlinkSync(req.file.path);
    fs.unlinkSync(tempPath);

    // --- 5️⃣ Save item to DB with logged-in user ---
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
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message || "Server error during upload" });
  }
});

export default router;
