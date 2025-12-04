import mongoose from "mongoose";
import Item from "../models/Item.js";

// Get items (optionally by category) for the logged-in user
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

// Create a new item for the logged-in user
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
