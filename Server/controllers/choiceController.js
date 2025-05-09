import Choice from "../models/choice.js";

// Get all choices
export const getChoices = async (req, res) => {
  try {
    const choices = await Choice.find();
    res.json(choices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get choice by ID
export const getChoiceById = async (req, res) => {
  try {
    const choice = await Choice.findById(req.params.id);
    if (!choice) {
      return res.status(404).json({ message: "Choice not found" });
    }
    res.json(choice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get choices by dialogue ID
export const getChoicesByDialogue = async (req, res) => {
  try {
    const { dialogueId } = req.params;
    const choices = await Choice.find({ dialogue_id: dialogueId });
    res.json(choices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new choice
export const createChoice = async (req, res) => {
  try {
    const { choice_id, dialogue_id, package_id, text, respond, alt_text } =
      req.body;

    // Validate required fields
    if (!choice_id || !dialogue_id || !text) {
      return res.status(400).json({
        message: "Choice ID, dialogue ID, and text are required",
      });
    }

    const newChoice = new Choice({
      choice_id: String(choice_id),
      dialogue_id: String(dialogue_id),
      package_id: package_id ? String(package_id) : undefined,
      text,
      respond,
      alt_text: alt_text ? String(alt_text) : undefined,
    });

    const savedChoice = await newChoice.save();
    res.status(201).json(savedChoice);
  } catch (error) {
    console.error("Error creating choice:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update choice
export const updateChoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { choice_id, dialogue_id, package_id, text, respond, alt_text } =
      req.body;

    // Find choice by ID
    const choice = await Choice.findById(id);

    if (!choice) {
      return res.status(404).json({ message: "Choice not found" });
    }

    // Update fields if provided
    if (choice_id) choice.choice_id = String(choice_id);
    if (dialogue_id) choice.dialogue_id = String(dialogue_id);
    if (package_id !== undefined)
      choice.package_id = package_id ? String(package_id) : undefined;
    if (text) choice.text = text;
    if (respond !== undefined) choice.respond = respond;
    if (alt_text !== undefined)
      choice.alt_text = alt_text ? String(alt_text) : undefined;

    const updatedChoice = await choice.save();
    res.json(updatedChoice);
  } catch (error) {
    console.error("Error updating choice:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete choice
export const deleteChoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the choice
    const result = await Choice.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Choice not found" });
    }

    res.json({ message: "Choice deleted successfully" });
  } catch (error) {
    console.error("Error deleting choice:", error);
    res.status(500).json({ message: error.message });
  }
};
