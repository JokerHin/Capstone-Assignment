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
subquestRouter.get("/", getSubquests);
subquestRouter.get("/:id", getSubquestById);

// POST route
subquestRouter.post("/", createSubquest);

// PUT route
subquestRouter.put("/:id", updateSubquest);

// DELETE route
subquestRouter.delete("/:id", deleteSubquest);

export default subquestRouter;
