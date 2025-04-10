import express from "express";
import {
  getUserStats,
  getUsers,
  addUser,
  deleteUser,
  updateUser,
} from "../controllers/adminController.js";
import {
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "../controllers/achievementController.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";

const adminRouter = express.Router();

// User management routes
adminRouter.get("/user-stats", userAuth, adminAuth, getUserStats);
adminRouter.get("/users", userAuth, adminAuth, getUsers);
adminRouter.post("/add-user", userAuth, adminAuth, addUser);
adminRouter.put("/update-user/:userId", userAuth, adminAuth, updateUser);
adminRouter.delete("/delete-user/:userId", userAuth, adminAuth, deleteUser);

// Achievement management routes
adminRouter.get("/achievements", userAuth, adminAuth, getAllAchievements);
adminRouter.get("/achievements/:id", userAuth, adminAuth, getAchievementById);
adminRouter.post("/achievements", userAuth, adminAuth, createAchievement);
adminRouter.put("/achievements/:id", userAuth, adminAuth, updateAchievement);
adminRouter.delete("/achievements/:id", userAuth, adminAuth, deleteAchievement);

export default adminRouter;
