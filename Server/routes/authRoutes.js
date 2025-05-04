import express from "express";
import {
  register,
  login,
  logout,
  isAuth,
  me,
} from "../controllers/authController.js";

const authRouter = express.Router();

// Authentication routes
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/is-auth", isAuth);
authRouter.get("/me", me);

export default authRouter;
