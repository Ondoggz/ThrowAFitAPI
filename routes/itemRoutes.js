import express from "express";
import { getItems } from "../controllers/itemController.js";
import { auth } from "./authRoutes.js"; // ensure auth middleware

const router = express.Router();

// Fetch all items for logged-in user
router.get("/", auth, getItems);

// Fetch by category for logged-in user
router.get("/accessories", auth, (req, res) => getItems(req, res, "accessories"));
router.get("/tops", auth, (req, res) => getItems(req, res, "tops"));
router.get("/bottoms", auth, (req, res) => getItems(req, res, "bottoms"));
router.get("/shoes", auth, (req, res) => getItems(req, res, "shoes"));

export default router;
