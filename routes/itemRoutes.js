import express from "express";
import { getItems } from "../controllers/itemController.js";

const router = express.Router();

// 🛑 Helper function for category filtering (defined here for simplicity)
function getItemsByCategory(req, res, category) {
    getItems(req, res, category);
}

// GET all items (No Category Filter)
router.get("/", getItems);

// ❌ The POST / route is removed as item creation with uploads is handled by /api/upload

// GET items by category
router.get("/accessories", (req, res) => getItemsByCategory(req, res, "accessories"));
router.get("/tops", (req, res) => getItemsByCategory(req, res, "tops"));
router.get("/bottoms", (req, res) => getItemsByCategory(req, res, "bottoms"));
router.get("/shoes", (req, res) => getItemsByCategory(req, res, "shoes"));

export default router;