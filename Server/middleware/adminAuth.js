import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";
import userModel from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
  try {
    // Get the token from cookies or Authorization header
    const token =
      req.cookies.jwt ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login as admin",
      });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if the token has ID (could be id, userId, or adminId)
      const userId = decoded.id || decoded.userId || decoded.adminId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Invalid token format",
        });
      }

      // First try to find admin by ID
      let admin = await adminModel.findById(userId);

      // If not found in admin collection, look in users collection
      if (!admin) {
        const user = await userModel.findById(userId);
        if (!user || user.userType !== "admin") {
          return res.status(401).json({
            success: false,
            message: "Not authorized as admin",
          });
        }

        // User is an admin
        req.admin = user;
        req.userId = user._id;
        req.isAdmin = true;
      } else {
        // Found in admin collection
        req.admin = admin;
        req.adminId = admin._id;
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

export default adminAuth;
