import achievementModel from "../models/achievementModel.js";

// Get all achievements
export const getAllAchievements = async (req, res) => {
  try {
    const achievements = await achievementModel.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      achievements,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching achievements",
      error: error.message,
    });
  }
};

// Get achievement by ID
export const getAchievementById = async (req, res) => {
  try {
    const achievement = await achievementModel.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    return res.json({
      success: true,
      achievement,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching achievement",
      error: error.message,
    });
  }
};

// Create new achievement
export const createAchievement = async (req, res) => {
  try {
    const { name, description, points, rarity, game } = req.body;

    // Validate required fields
    if (!name || !description || !game) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and game are required",
      });
    }

    // Create new achievement
    const newAchievement = new achievementModel({
      name,
      description,
      points: points || 10,
      rarity: rarity || "common",
      game,
    });

    await newAchievement.save();

    return res.status(201).json({
      success: true,
      message: "Achievement created successfully",
      achievement: newAchievement,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating achievement",
      error: error.message,
    });
  }
};

// Update achievement
export const updateAchievement = async (req, res) => {
  try {
    const { name, description, points, rarity, game } = req.body;

    // Find achievement
    const achievement = await achievementModel.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    // Update fields
    if (name) achievement.name = name;
    if (description) achievement.description = description;
    if (points) achievement.points = points;
    if (rarity) achievement.rarity = rarity;
    if (game) achievement.game = game;

    await achievement.save();

    return res.json({
      success: true,
      message: "Achievement updated successfully",
      achievement,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating achievement",
      error: error.message,
    });
  }
};

// Delete achievement
export const deleteAchievement = async (req, res) => {
  try {
    const achievement = await achievementModel.findByIdAndDelete(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    return res.json({
      success: true,
      message: "Achievement deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting achievement",
      error: error.message,
    });
  }
};
