import userModel from "../models/userModel.js";
import achievementModel from "../models/achievementModel.js";
import bcrypt from "bcryptjs";

// Get user statistics for admin dashboard
export const getUserStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await userModel.countDocuments();

    // Aggregate monthly registrations for the current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const monthlyStats = await userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.json({
      success: true,
      totalUsers,
      monthlyStats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};

// Get all users with pagination
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userType = req.query.userType || "user";

    // Get total count for pagination
    const totalUsers = await userModel.countDocuments({ userType });

    // Get users with pagination
    const users = await userModel
      .find({ userType })
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// Update a user as an admin
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, userType } = req.body;

    console.log(`Admin attempting to update user with ID: ${id}`);

    // Check if user exists
    const user = await userModel.findById(id);
    if (!user) {
      console.log(`User with ID ${id} not found`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update user fields if provided
    if (name) user.name = name;
    if (email) user.email = email;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Update user type if provided and admin has permission
    if (userType && req.admin.userType === "admin") {
      user.userType = userType;
    }

    // Save the user
    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Admin updateUser error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Add User function (missing export)
export const addUser = async (req, res) => {
  try {
    const { name, email, password, userType = "user" } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      userType:
        userType === "admin" && req.admin.userType === "admin"
          ? "admin"
          : "user",
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      userData: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
      },
    });
  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// Achievement Management Functions

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
    if (!name || !game) {
      return res.status(400).json({
        success: false,
        message: "Name and game are required",
      });
    }

    // Create new achievement
    const newAchievement = new achievementModel({
      name,
      description,
      points: points || 0,
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
    if (description !== undefined) achievement.description = description;
    if (points !== undefined) achievement.points = points;
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
