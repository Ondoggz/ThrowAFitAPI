import Item from "../models/Item.js";

export const getItems = async (req, res, category) => {
  try {
    let query = {};

    // If a category string was passed (tops, bottoms…)
    if (category) {
      query.category = category;
    }

    const items = await Item.find(query);
    res.json(items);

  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Server error fetching items" });
  }
};
