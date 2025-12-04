import Item from "../models/Item.js";

export const getItems = async (req, res, category) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const filter = { user: req.user._id };
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
    const { name, category, imageUrl } = req.body;
    const newItem = new Item({
      name,
      category,
      imageUrl,
      user: req.user._id, // 🔹 associate item with logged-in user
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
