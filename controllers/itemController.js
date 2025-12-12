import mongoose from "mongoose";
import Item from "../models/Item.js";

// ────────── Get items (optionally by category) ──────────
export const getItems = async (req, res, category) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const filter = { user: new mongoose.Types.ObjectId(req.user.id) };
    if (category) filter.category = category;

    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ────────── Create a new item ──────────
export const createItem = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { name, category, imageUrl } = req.body;
    const newItem = new Item({
      name,
      category,
      imageUrl,
      user: new mongoose.Types.ObjectId(req.user.id), // associate with logged-in user
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ────────── Delete an item ──────────
export const deleteItem = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const itemId = req.params.id;

    // Make sure the item belongs to the logged-in user
    const item = await Item.findOne({ _id: itemId, user: req.user.id });
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.remove();
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ message: "Server error deleting item" });
  }
};
