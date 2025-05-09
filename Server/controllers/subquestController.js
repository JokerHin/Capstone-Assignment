import Subquest from "../models/subquest.js";

// Get all subquests
export const getSubquests = async (req, res) => {
  try {
    const subquests = await Subquest.find(); // Fetch all subquests
    res.json(subquests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subquest by ID
export const getSubquestById = async (req, res) => {
  try {
    const subquest = await Subquest.findById(req.params.id);
    if (!subquest) {
      return res.status(404).json({ message: "Subquest not found" });
    }
    res.json(subquest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new subquest
export const createSubquest = async (req, res) => {
  try {
    const { title, description, quest_id, subquest_id, admin_id } = req.body;

    // Validate required fields
    if (!title || !quest_id) {
      return res
        .status(400)
        .json({ message: "Title and quest_id are required" });
    }

    const newSubquest = new Subquest({
      title,
      description,
      quest_id,
      subquest_id,
      admin_id,
    });

    const savedSubquest = await newSubquest.save();
    res.status(201).json(savedSubquest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update subquest
export const updateSubquest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, quest_id, subquest_id, admin_id } = req.body;

    // Find subquest by ID
    const subquest = await Subquest.findById(id);

    if (!subquest) {
      return res.status(404).json({ message: "Subquest not found" });
    }

    // Update fields if provided
    if (title) subquest.title = title;
    if (description !== undefined) subquest.description = description;
    if (quest_id) subquest.quest_id = quest_id;
    if (subquest_id) subquest.subquest_id = subquest_id;
    if (admin_id) subquest.admin_id = admin_id;

    const updatedSubquest = await subquest.save();
    res.json(updatedSubquest);
  } catch (error) {
    console.error("Error updating subquest:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete subquest
export const deleteSubquest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the subquest
    const result = await Subquest.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Subquest not found" });
    }

    res.json({ message: "Subquest deleted successfully" });
  } catch (error) {
    console.error("Error deleting subquest:", error);
    res.status(500).json({ message: error.message });
  }
};
