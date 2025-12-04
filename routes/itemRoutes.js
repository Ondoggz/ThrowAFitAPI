import express from "express";
import { getItems } from "../controllers/itemController.js";
import verifyToken from "../middleware/verifyToken.js"; // JWT middleware

const router = express.Router();

// Helper function for category filtering
function getItemsByCategory(req, res, category) {
    getItems(req, res, category);
}

// Secure all GET requests with verifyToken
router.get("/", verifyToken, getItems);

// Category-specific routes
router.get("/accessories", verifyToken, (req, res) => getItemsByCategory(req, res, "accessories"));
router.get("/tops", verifyToken, (req, res) => getItemsByCategory(req, res, "tops"));
router.get("/bottoms", verifyToken, (req, res) => getItemsByCategory(req, res, "bottoms"));
router.get("/shoes", verifyToken, (req, res) => getItemsByCategory(req, res, "shoes"));

export default router;
