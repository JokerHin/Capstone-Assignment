import express from "express";
import {
  getChoices,
  getChoiceById,
  getChoicesByDialogue,
  createChoice,
  updateChoice,
  deleteChoice,
} from "../controllers/choiceController.js";

const choiceRouter = express.Router();

// GET routes
choiceRouter.get("/", getChoices);
choiceRouter.get("/:id", getChoiceById);
choiceRouter.get("/dialogue/:dialogueId", getChoicesByDialogue);

// POST route
choiceRouter.post("/", createChoice);

// PUT route
choiceRouter.put("/:id", updateChoice);

// DELETE route
choiceRouter.delete("/:id", deleteChoice);

export default choiceRouter;
