import express from "express";
import {
  getPositions,
  getPositionById,
  getPositionsBySubquest,
  updatePosition,
  deletePosition
} from "../controllers/positionController.js";

const positionRouter = express.Router();

// GET routes
positionRouter.get("/", getPositions);
positionRouter.get("/:id", getPositionById);
positionRouter.get("/subquest/:subquestId", getPositionsBySubquest);
positionRouter.put("/:id", updatePosition);
positionRouter.delete("/:id", deletePosition);

export default positionRouter;
