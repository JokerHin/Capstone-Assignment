import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies.jwt ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get the user ID from the token
      const userId = decoded.id;

      const isAdmin = decoded.userType === "admin";

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Invalid token format",
        });
      }

      // Find the user
      const user = await userModel.findById(userId);
      if (!user && !isAdmin) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Set user in request
      req.user = userId;

      // If admin token, mark as admin
      if (isAdmin) {
        req.isAdmin = true;
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default userAuth;
