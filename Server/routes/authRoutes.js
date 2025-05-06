import express from "express";
import {
  login,
  logout,
  register,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword,
  me,
} from "../controllers/authController.js";

const authRouter = express.Router();

// Auth routes
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", sendVerifyOtp);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/me", me);

export default authRouter;
