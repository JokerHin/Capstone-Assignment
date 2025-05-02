import express from "express";
import {
  getSubquests,
  getSubquestById,
  createSubquest,
  updateSubquest,
  deleteSubquest,
} from "../controllers/subquestController.js";

const subquestRouter = express.Router();

// GET routes
subquestRouter.get("/", getSubquests); // Get all subquests
subquestRouter.get("/:id", getSubquestById); // Get specific subquest

// POST route
subquestRouter.post("/", createSubquest); // Create new subquest

// PUT route
subquestRouter.put("/:id", updateSubquest); // Update existing subquest

// DELETE route
subquestRouter.delete("/:id", deleteSubquest); // Delete subquest

export default subquestRouter;
