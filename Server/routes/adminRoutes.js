import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  getUserStats,
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// Admin authentication for all routes
adminRouter.use(adminAuth);

// User management routes
adminRouter.get("/user-stats", getUserStats);
adminRouter.get("/users", getAllUsers);
adminRouter.get("/users/:id", getUserById);
adminRouter.post("/add-user", addUser);
adminRouter.put("/update-user/:id", updateUser);
adminRouter.delete("/delete-user/:id", deleteUser);

// Achievement management routes
adminRouter.get("/achievements", getAllAchievements);
adminRouter.get("/achievements/:id", getAchievementById);
adminRouter.post("/achievements", createAchievement);
adminRouter.put("/achievements/:id", updateAchievement);
adminRouter.delete("/achievements/:id", deleteAchievement);

export default adminRouter;
