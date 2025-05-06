import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  getUserStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  addUser,
} from "../controllers/adminController.js";
import {
  getItems,
  getItemById,
  updateItem,
} from "../controllers/itemController.js";

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
adminRouter.get("/achievements", adminAuth, async (req, res) => {
  try {
    // Filter items to only get badges
    req.query.type = "badge";
    const items = await getItems(req, res);
    return items;
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching achievements",
      error: error.message,
    });
  }
});

adminRouter.get("/achievements/:id", adminAuth, getItemById);
adminRouter.put("/achievements/:id", adminAuth, updateItem);

export default adminRouter;
