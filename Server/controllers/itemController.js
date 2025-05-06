import Item from "../models/item.js";

// Get all items
export const getItems = async (req, res) => {
  try {
    // Can filter by type if requested
    const filter = req.query.type ? { type: req.query.type } : {};
    const items = await Item.find(filter).sort({ item_id: 1 });

    // Format the response for achievements when type=badge
    if (req.query.type === "badge") {
      const formattedItems = items.map((item) => ({
        _id: item._id,
        item_id: item.item_id,
        name: item.name,
        description: item.description || "",
        rarity: item.rarity || "common",
        game: item.game || "All Games",
        points: item.points || 0,
      }));

      return res.json({
        success: true,
        achievements: formattedItems,
      });
    }

    // Standard response for other item types
    return res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get item by ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // First try to find by MongoDB _id
    let item = await Item.findById(id);

    // If not found and id is a number, try to find by item_id
    if (!item && !isNaN(id)) {
      item = await Item.findOne({ item_id: Number(id) });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Special response for achievement endpoints
    if (req.originalUrl.includes("/achievements/")) {
      return res.json({
        success: true,
        achievement: {
          _id: item._id,
          item_id: item.item_id,
          name: item.name,
          description: item.description || "",
          rarity: item.rarity || "common",
          game: item.game || "All Games",
          points: item.points || 0,
        },
      });
    }

    // Standard response for other items
    return res.json(item);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Find the item
    let item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Update allowed fields
    if (name) item.name = name;
    if (description !== undefined) item.description = description;

    // Save the item
    await item.save();

    // Special response for achievement endpoints
    if (req.originalUrl.includes("/achievements/")) {
      return res.json({
        success: true,
        message: "Achievement updated successfully",
        achievement: {
          _id: item._id,
          item_id: item.item_id,
          name: item.name,
          description: item.description || "",
          rarity: item.rarity || "common",
          game: item.game || "All Games",
          points: item.points || 0,
        },
      });
    }

    // Standard response for other items
    return res.json({
      success: true,
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
