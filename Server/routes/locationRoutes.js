import express from "express";
import { getLocations,addLocation,deleteAllLocations } from "../controllers/locationController.js";

const locationRouter = express.Router();

locationRouter.get("/", getLocations); // Add route to fetch location data
locationRouter.post("/", addLocation);
locationRouter.delete("/clear", deleteAllLocations);

export default locationRouter;
