import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // This should export the configured cloudinary instance

const router = express.Router();

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ThrowAFit", // your Cloudinary folder
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// Multer setup using the Cloudinary storage
const upload = multer({ storage });

// Upload endpoint
// The 'image' field must match formData.append("image", file) on the frontend
router.post("/", upload.single("image"), (req, res) => {
  
  // FIX: Check if the file was processed by Multer/Cloudinary
  if (!req.file) {
    console.error("Upload failed: req.file is undefined. Check Cloudinary credentials or file size limits.");
    return res.status(400).json({ 
      message: "❌ Image upload failed. File was not processed." 
    });
  }
  
  // Success response
  res.json({
    message: "✅ Image uploaded successfully!",
    imageUrl: req.file.path, // Use imageUrl to match the frontend console log
  });
});

// These logs are less reliable here, but can help debug initial loading
console.log("Cloud name (Route Load):", process.env.CLOUDINARY_CLOUD_NAME);

export default router;