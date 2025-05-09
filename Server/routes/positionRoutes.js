import express from "express";
import {
  getPositions,
  getPositionById,
  getPositionsBySubquest,
} from "../controllers/positionController.js";

const positionRouter = express.Router();

// GET routes
positionRouter.get("/", getPositions);
positionRouter.get("/:id", getPositionById);
positionRouter.get("/subquest/:subquestId", getPositionsBySubquest);

export default positionRouter;
