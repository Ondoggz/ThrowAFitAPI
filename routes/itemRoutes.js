import express from "express";
import { getItems, createItem } from "../controllers/itemController.js";

const router = express.Router();

router.get("/", getItems);
router.post("/", createItem);

// Base route
router.get("/", (req, res) => {
  res.send("This is the Throw-A-Fit Classifier API");
});

// Category routes
router.get("/accessories", (req, res) => {
  res.send("This is the Accessories category");
});

router.get("/tops", (req, res) => {
  res.send("This is the Tops category");
});

router.get("/bottoms", (req, res) => {
  res.send("This is the Bottoms category");
});

router.get("/shoes", (req, res) => {
  res.send("This is the Shoes category");
});

export default router;
