import Item from "../models/Item.js";

export const generateFit = async (req, res) => {
  try {
    const options = req.body; // { fullRandom, colors, patterns, styles }
    const userId = req.user.id;

    const allItems = await Item.find({ user: userId });

    // 1️⃣ Categorize by DB category (clean & reliable)
    const buckets = {
      tops: allItems.filter(i => i.category === "tops"),
      bottoms: allItems.filter(i => i.category === "bottoms"),
      shoes: allItems.filter(i => i.category === "shoes"),
      accessories: allItems.filter(i => i.category === "accessories"),
    };

    // 2️⃣ Filter logic using structured fields
    const matchesFilter = (item) => {
      if (options.fullRandom) return true;

      if (options.colors?.length && !options.colors.includes(item.color)) return false;
      if (options.patterns?.length && !options.patterns.includes(item.pattern)) return false;
      if (options.styles?.length && !options.styles.includes(item.style)) return false;

      return true;
    };

    const filteredBuckets = {};
    for (const type in buckets) {
      filteredBuckets[type] = buckets[type].filter(matchesFilter);
    }

    // 3️⃣ Random picker
    const pickRandom = (arr) =>
      arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

    // 4️⃣ Build outfit (explicit keys — no string slicing bugs)
    const outfit = {
      top:
        filteredBuckets.tops.length
          ? pickRandom(filteredBuckets.tops)
          : options.fullRandom
            ? pickRandom(buckets.tops)
            : null,

      bottom:
        filteredBuckets.bottoms.length
          ? pickRandom(filteredBuckets.bottoms)
          : options.fullRandom
            ? pickRandom(buckets.bottoms)
            : null,

      shoes:
        filteredBuckets.shoes.length
          ? pickRandom(filteredBuckets.shoes)
          : options.fullRandom
            ? pickRandom(buckets.shoes)
            : null,

      accessory:
        filteredBuckets.accessories.length
          ? pickRandom(filteredBuckets.accessories)
          : options.fullRandom
            ? pickRandom(buckets.accessories)
            : null,
    };

    res.json({ outfit });

  } catch (err) {
    console.error("GenerateFit Error:", err);
    res.status(500).json({ message: "Server error generating fit." });
  }
};
