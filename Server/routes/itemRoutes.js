import express from "express";
import {
  getItems,
  getItemById,
  updateItem,
} from "../controllers/itemController.js";

const itemRouter = express.Router();

// GET routes
itemRouter.get("/", getItems);
itemRouter.get("/:id", getItemById);

// PUT route
itemRouter.put("/:id", updateItem);

export default itemRouter;
