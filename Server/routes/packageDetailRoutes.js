import express from "express";
import {
  getPackageDetails,
  getPackageDetailsByPackageId,
  createPackageDetail,
  updatePackageDetail,
  deletePackageDetail,
  deletePackageDetailsByPackageId,
} from "../controllers/packageDetailController.js";

const packageDetailRouter = express.Router();

// Get all package details
packageDetailRouter.get("/", getPackageDetails);

// Get package details by package ID
packageDetailRouter.get("/package/:packageId", getPackageDetailsByPackageId);

// Create a new package detail
packageDetailRouter.post("/", createPackageDetail);

// Update a package detail
packageDetailRouter.put("/:id", updatePackageDetail);

// Delete a package detail
packageDetailRouter.delete("/:id", deletePackageDetail);

// Delete all package details for a package
packageDetailRouter.delete(
  "/package/:packageId",
  deletePackageDetailsByPackageId
);

export default packageDetailRouter;
