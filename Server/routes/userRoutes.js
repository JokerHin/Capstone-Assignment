import express from "express";
import { getUserData, updateProfile } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/data", getUserData);
userRouter.put("/update-profile", updateProfile);

export default userRouter;
