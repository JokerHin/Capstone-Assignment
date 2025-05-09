import Item from "../models/item.js";

// Get all items
export const getItems = async (req, res) => {
  try {
    const filter = req.query.type ? { type: req.query.type } : {};
    const items = await Item.find(filter).sort({ item_id: 1 });

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

    let item = await Item.findById(id);

    if (!item && !isNaN(id)) {
      item = await Item.findOne({ item_id: id });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.json(item);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new item
export const createItem = async (req, res) => {
  try {
    const { item_id, name, type, description } = req.body;

    if (!item_id || !name || !type) {
      return res.status(400).json({
        success: false,
        message: "Item ID, name, and type are required",
      });
    }

    const existingItem = await Item.findOne({ item_id });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "An item with this ID already exists",
      });
    }

    // Create new item
    const newItem = new Item({
      item_id,
      name,
      type,
      description: description || "",
    });

    await newItem.save();

    return res.status(201).json({
      success: true,
      message: "Item created successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("Error creating item:", error);
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
    const { name, type, description } = req.body;

    let item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Update allowed fields
    if (name) item.name = name;
    if (type) item.type = type;
    if (description !== undefined) item.description = description;

    await item.save();

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

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
