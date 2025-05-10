import express from "express";
import {
  getPackages,
  getPackageById,
  getPackagesBySubquest,
  createPackage,
  updatePackage,
  deletePackage,
} from "../controllers/packageController.js";

const packageRouter = express.Router();

// Get all packages
packageRouter.get("/", getPackages);

// Get package by ID
packageRouter.get("/:id", getPackageById);

// Get packages by subquest ID
packageRouter.get("/subquest/:subquestId", getPackagesBySubquest);

// Create a new package
packageRouter.post("/", createPackage);

// Update a package
packageRouter.put("/:id", updatePackage);

// Delete a package
packageRouter.delete("/:id", deletePackage);

export default packageRouter;
