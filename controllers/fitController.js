import Item from "../models/Item.js";

// Clothing type detection (based on item *name*, not category field)
const typeRules = {
  tops: /(top|shirt|hoodie|blouse|jacket|tshirt|sando)/i,
  bottoms: /(pants|shorts|jeans|skirt|bottom|trousers|joggers)/i,
  shoes: /(shoes|sneakers|boots|heels|slippers)/i,
  accessories: /(hat|cap|necklace|bracelet|earrings|ring|bag|accessory)/i
};

// Helper: check if name contains any selected filter
const matchesFilter = (name, options) => {
  const lower = name.toLowerCase();

  if (!options.fullRandom) {
    if (options.colors?.length) {
      const colorMatch = options.colors.some(c => lower.includes(c.toLowerCase()));
      if (!colorMatch) return false;
    }
    if (options.patterns?.length) {
      const patternMatch = options.patterns.some(p => lower.includes(p.toLowerCase()));
      if (!patternMatch) return false;
    }
    if (options.styles?.length) {
      const styleMatch = options.styles.some(s => lower.includes(s.toLowerCase()));
      if (!styleMatch) return false;
    }
  }

  return true;
};

export const generateFit = async (req, res) => {
  try {
    const options = req.body;
    const userId = req.user.id;

    const allItems = await Item.find({ user: userId });

    const buckets = { tops: [], bottoms: [], shoes: [], accessories: [] };

    allItems.forEach(item => {
      for (const type in typeRules) {
        if (typeRules[type].test(item.name)) {
          buckets[type].push(item);
          break;
        }
      }
    });

    const filteredBuckets = {};
    for (const type in buckets) {
      filteredBuckets[type] = buckets[type].filter(item =>
        matchesFilter(item.name, options)
      );
    }

    const pickRandom = arr =>
      arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

    const outfit = {};
    for (const type of ["tops", "bottoms", "shoes", "accessories"]) {
      const filtered = filteredBuckets[type];
      const original = buckets[type];

      outfit[type.slice(0, -1)] =
        filtered.length
          ? pickRandom(filtered)
          : options.fullRandom
            ? pickRandom(original)
            : null;
    }

    res.json({ outfit });

  } catch (err) {
    console.error("GenerateFit Error:", err);
    res.status(500).json({ message: "Server error generating fit." });
  }
};
