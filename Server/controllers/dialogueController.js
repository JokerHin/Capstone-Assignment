import Dialogue from "../models/dialogue.js";

// Get all dialogues
export const getDialogues = async (req, res) => {
  try {
    const dialogues = await Dialogue.find(); // Fetch all dialogues
    res.json(dialogues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dialogue by ID
export const getDialogueById = async (req, res) => {
  try {
    const dialogue = await Dialogue.findById(req.params.id);
    if (!dialogue) {
      return res.status(404).json({ message: "Dialogue not found" });
    }
    res.json(dialogue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new dialogue
export const createDialogue = async (req, res) => {
  try {
    const { text, dialogue_id, position_id, package_id, action_id } = req.body;

    // Validate required fields
    if (!text || !dialogue_id) {
      return res
        .status(400)
        .json({ message: "Text and dialogue_id are required" });
    }

    // Make sure all IDs are stored as strings to match DB structure
    const newDialogue = new Dialogue({
      text,
      dialogue_id: String(dialogue_id), // Ensure string type
      position_id: position_id ? String(position_id) : undefined,
      package_id: package_id ? String(package_id) : undefined,
      action_id: action_id ? String(action_id) : undefined,
    });

    const savedDialogue = await newDialogue.save();
    res.status(201).json(savedDialogue);
  } catch (error) {
    console.error("Error creating dialogue:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update dialogue
export const updateDialogue = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, dialogue_id, position_id, package_id, action_id } = req.body;

    // Find dialogue by ID
    const dialogue = await Dialogue.findById(id);

    if (!dialogue) {
      return res.status(404).json({ message: "Dialogue not found" });
    }

    if (text) dialogue.text = text;
    if (dialogue_id) dialogue.dialogue_id = String(dialogue_id);
    d;
    if (position_id !== undefined)
      dialogue.position_id = position_id ? String(position_id) : undefined;
    if (package_id !== undefined)
      dialogue.package_id = package_id ? String(package_id) : undefined;
    if (action_id !== undefined)
      dialogue.action_id = action_id ? String(action_id) : undefined;

    const updatedDialogue = await dialogue.save();
    res.json(updatedDialogue);
  } catch (error) {
    console.error("Error updating dialogue:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete dialogue
export const deleteDialogue = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Dialogue.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Dialogue not found" });
    }

    res.json({ message: "Dialogue deleted successfully" });
  } catch (error) {
    console.error("Error deleting dialogue:", error);
    res.status(500).json({ message: error.message });
  }
};
