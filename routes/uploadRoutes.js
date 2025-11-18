import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary"; // Import Cloudinary instance
import fs from "fs/promises"; // For deleting the local file later
import axios from "axios"; // HTTP client for remove.bg API call

const router = express.Router();

// 1. Configure Multer for DISK STORAGE (temporary local storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use a temporary folder. Make sure this folder exists on Render/your server.
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Use the original name with a timestamp to ensure uniqueness
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// 2. The combined route handler
router.post("/", upload.single("image"), async (req, res) => {
    
    if (!req.file) {
        return res.status(400).json({ message: "No file received." });
    }

    const localFilePath = req.file.path;
    let removeBgApiResult;
    let cloudinaryResult;

    try {
        // 🔴 STEP 1 & 2: Send to remove.bg API
        removeBgApiResult = await axios({
            method: 'post',
            url: 'https://api.remove.bg/v1.0/removebg',
            headers: {
                // Ensure REMOVE_BG_API_KEY is set in your .env or Render variables
                'X-Api-Key': process.env.REMOVE_BG_API_KEY, 
            },
            data: {
                image_file_b64: req.file.buffer.toString('base64'), // Send file data as Base64
                size: 'auto',
                type: 'product', // Optional: Optimizes removal for product images
            },
            responseType: 'arraybuffer' // We expect binary data (the processed image)
        });

        // 🔴 STEP 3 & 4: Upload processed image data to Cloudinary
        // Convert the binary response buffer into a Base64 string for Cloudinary upload
        const processedImageBase64 = Buffer.from(removeBgApiResult.data).toString('base64');
        const dataUri = `data:image/png;base64,${processedImageBase64}`;

        cloudinaryResult = await cloudinary.uploader.upload(dataUri, {
            folder: "ThrowAFit",
            // Optional: Specify format since remove.bg output is usually PNG (for transparency)
            format: 'png', 
        });

        // 5. Success Response
        res.status(200).json({
            message: "✅ Image uploaded with background removed!",
            imageUrl: cloudinaryResult.secure_url,
        });

    } catch (error) {
        console.error("Upload/RemoveBG Error:", error.message);
        
        // Handle specific remove.bg errors
        if (error.response && error.response.data) {
            console.error("remove.bg API Error:", Buffer.from(error.response.data).toString('utf8'));
        }

        res.status(500).json({ message: "❌ Failed to process or upload image." });

    } finally {
        // 6. Cleanup: Delete the temporary local file
        try {
            await fs.unlink(localFilePath);
            console.log(`Cleaned up local file: ${localFilePath}`);
        } catch (cleanupError) {
            console.error("Cleanup failed:", cleanupError.message);
        }
    }
});

export default router;