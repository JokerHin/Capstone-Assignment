import express from "express";
import { getQuests, updateQuest } from "../controllers/questController.js";
import mongoose from "mongoose"; // Add this import

const questRouter = express.Router();

questRouter.get("/", getQuests);

// Improve the route to handle both MongoDB _id and quest_id
questRouter.put("/:id", updateQuest);

export default questRouter;
