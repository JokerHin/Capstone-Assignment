import express from "express";
import { getUserData, updateProfile, updateUserLocation } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/data", getUserData);
userRouter.put("/update-profile", updateProfile);
userRouter.post("/update-location", updateUserLocation);

export default userRouter;
