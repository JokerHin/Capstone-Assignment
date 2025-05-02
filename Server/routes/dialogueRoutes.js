import express from "express";
import {
  getDialogues,
  getDialogueById,
  createDialogue,
  updateDialogue,
  deleteDialogue,
} from "../controllers/dialogueController.js";

const dialogueRouter = express.Router();

// GET routes
dialogueRouter.get("/", getDialogues); // Get all dialogues
dialogueRouter.get("/:id", getDialogueById); // Get specific dialogue

// POST route
dialogueRouter.post("/", createDialogue); // Create new dialogue

// PUT route
dialogueRouter.put("/:id", updateDialogue); // Update existing dialogue

// DELETE route
dialogueRouter.delete("/:id", deleteDialogue); // Delete dialogue

export default dialogueRouter;
