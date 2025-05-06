import express from "express";
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

// Add OPTIONS method handling for preflight requests and better CORS support
adminRouter.options("*", (req, res) => {
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, admin-email, Authorization"
  );
  res.status(200).end();
});

adminRouter.use((req, res, next) => {
  console.log(`Admin API request: ${req.method} ${req.url}`);
  console.log("Headers:", {
    "admin-email": req.headers["admin-email"],
    authorization: req.headers["authorization"] ? "Present" : "Missing",
    "content-type": req.headers["content-type"],
  });
  console.log("Query:", req.query);
  console.log("Cookies:", req.cookies);
  console.log("Body:", req.body);
  next();
});

// Accept both GET and POST for user-stats to simplify testing and development
adminRouter.get("/user-stats", getUserStats);
adminRouter.post("/user-stats", getUserStats);

// User management endpoints - support both GET (preferred) and POST (fallback)
adminRouter.get("/users", getAllUsers);
adminRouter.post("/users", getAllUsers);
adminRouter.get("/users/:id", getUserById);
adminRouter.post("/users/:id", getUserById);
adminRouter.post("/users/:id/update", updateUser);
adminRouter.post("/users/:id/delete", deleteUser);

// Add logging for the add-user route to help with debugging
adminRouter.post(
  "/add-user",
  (req, res, next) => {
    console.log("Add User Route Hit:", {
      method: req.method,
      url: req.url,
      body: req.body,
      headers: {
        "admin-email": req.headers["admin-email"],
        "content-type": req.headers["content-type"],
        authorization: req.headers["authorization"] ? "Present" : "Missing",
      },
      cookies: req.cookies,
    });
    next();
  },
  addUser
);

// Achievement endpoints
adminRouter.get("/achievements", async (req, res) => {
  try {
    req.query.type = "badge";
    await getItems(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching achievements",
      error: error.message,
    });
  }
});

// Add proper route for updating achievements - with explicit options for POST method
adminRouter.post("/achievements/:id/update", async (req, res) => {
  try {
    req.params.id = req.params.id;
    await updateItem(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating achievement",
      error: error.message,
    });
  }
});

export default adminRouter;
