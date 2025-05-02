import Quest from "../models/quest.js";

export const getQuests = async (req, res) => {
  try {
    const quests = await Quest.find(); // Fetch all quests
    res.json(quests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update quest controller - fixed to handle the proper way to find quests
export const updateQuest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, name, description } = req.body;

    // First try to find by _id
    let quest = await Quest.findById(id);

    // If not found, try to find by quest_id
    if (!quest && !mongoose.Types.ObjectId.isValid(id)) {
      quest = await Quest.findOne({ quest_id: parseInt(id) });
    }

    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    // Update fields if provided
    if (title) quest.title = title;
    if (name) quest.name = name;
    if (description !== undefined) quest.description = description;

    const updatedQuest = await quest.save();
    res.json(updatedQuest);
  } catch (error) {
    console.error("Error updating quest:", error);
    res.status(500).json({ message: error.message });
  }
};
