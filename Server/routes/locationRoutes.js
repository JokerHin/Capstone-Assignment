import express from "express";
import { getLocations,addLocation } from "../controllers/locationController.js";

const locationRouter = express.Router();

locationRouter.get("/", getLocations); // Add route to fetch location data
locationRouter.post("/", addLocation);

export default locationRouter;
