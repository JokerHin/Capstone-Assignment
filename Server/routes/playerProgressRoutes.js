import express from "express";
import {
  getPlayerProgresses,
  addPlayerProgress,
  updatePlayerProgressStatus,
  deleteAllPlayerProgresses,
} from "../controllers/playerProgressController.js";

const playerProgressRouter = express.Router();

playerProgressRouter.get("/", getPlayerProgresses);

playerProgressRouter.post("/", addPlayerProgress);

playerProgressRouter.post("/update", updatePlayerProgressStatus);

playerProgressRouter.delete("/clear", deleteAllPlayerProgresses);

export default playerProgressRouter;
