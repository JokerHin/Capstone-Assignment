import express from "express";
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

const itemRouter = express.Router();

// GET routes
itemRouter.get("/", getItems);
itemRouter.get("/:id", getItemById);

// POST route
itemRouter.post("/", createItem);

// PUT route
itemRouter.put("/:id", updateItem);

// DELETE route
itemRouter.delete("/:id", deleteItem);

export default itemRouter;
