import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary"; // Assuming this is the configured instance
import axios from "axios"; 
import fs from "fs/promises"; // Still needed for potential future use, but removed from logic

const router = express.Router();

// 1. 🟢 FIX: Use Multer Memory Storage
// This stores the file in req.file.buffer, avoiding the Render disk error (ENOENT).
const upload = multer({ 
    storage: multer.memoryStorage(),
    // Optional: Add file size limit for early rejection
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}); 

// 2. The combined route handler
router.post("/", upload.single("image"), async (req, res) => {
    
    // Check for Multer/File Errors before processing
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "❌ No file received or buffer missing." });
    }

    const fileBuffer = req.file.buffer;
    let removeBgApiResult;
    let cloudinaryResult;

    try {
        // --- STEP 1 & 2: Send to remove.bg API ---
        removeBgApiResult = await axios({
            method: 'post',
            url: 'https://api.remove.bg/v1.0/removebg',
            headers: {
                // 🛑 CRITICAL: Check this environment variable on Render
                'X-Api-Key': process.env.REMOVE_BG_API_KEY, 
            },
            data: {
                // Send file data as Base64 string for the API
                image_file_b64: fileBuffer.toString('base64'), 
                size: 'auto',
                type: 'product',
            },
            responseType: 'arraybuffer' // Expects binary image data back
        });

        // --- STEP 3 & 4: Upload processed image data to Cloudinary ---
        
        // Convert the binary response buffer into a Data URI for Cloudinary
        const processedImageBase64 = Buffer.from(removeBgApiResult.data).toString('base64');
        const dataUri = `data:image/png;base64,${processedImageBase64}`;

        cloudinaryResult = await cloudinary.uploader.upload(dataUri, {
            folder: "ThrowAFit",
            format: 'png', // Use PNG to preserve transparency
        });

        // 5. Success Response
        res.status(200).json({
            message: "✅ Image uploaded with background removed!",
            imageUrl: cloudinaryResult.secure_url,
        });

    } catch (error) {
        console.error("Upload/RemoveBG Error:", error.message);
        
        // Attempt to log specific error response from remove.bg
        if (error.response && error.response.data) {
            const apiError = Buffer.from(error.response.data).toString('utf8');
            console.error("remove.bg API Detail:", apiError);
            
            // Send a client-friendly error
            return res.status(error.response.status || 500).json({ 
                message: `❌ API Error during processing. Details: ${apiError.slice(0, 100)}...` 
            });
        }

        // Generic catch-all error
        return res.status(500).json({ message: "❌ Failed to process or upload image due to internal server error." });

    }
});

export default router;