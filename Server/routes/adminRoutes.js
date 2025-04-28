import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "../controllers/achievementController.js";
import {
  getUserStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// Admin dashboard statistics
adminRouter.get("/user-stats", adminAuth, getUserStats);

// User management routes
adminRouter.get("/users", adminAuth, getAllUsers);
adminRouter.get("/users/:id", adminAuth, getUserById);
adminRouter.put("/users/:id", adminAuth, updateUser);
adminRouter.delete("/users/:id", adminAuth, deleteUser);

// Achievement routes
adminRouter.get("/achievements", adminAuth, getAllAchievements);
adminRouter.get("/achievements/:id", adminAuth, getAchievementById);
adminRouter.post("/achievements", adminAuth, createAchievement);
adminRouter.put("/achievements/:id", adminAuth, updateAchievement);
adminRouter.delete("/achievements/:id", adminAuth, deleteAchievement);

export default adminRouter;
