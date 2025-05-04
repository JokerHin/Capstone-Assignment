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
      console.log("No auth token found");
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login as admin",
      });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token has admin userType - simplified approach
      if (decoded.userType !== "admin") {
        console.log("Token does not have admin privileges");
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      // Get the user ID from the token
      const userId = decoded.id;

      if (!userId) {
        console.log("Token contains no user ID");
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
          console.log("User not found or not admin type");
          return res.status(403).json({
            success: false,
            message: "Not authorized as admin",
          });
        }

        // User is an admin, add to request
        req.admin = user;
      } else {
        // Found in admin collection, add to request
        req.admin = admin;
      }

      // Continue to the protected route
      next();
    } catch (error) {
      console.log("Token verification error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    console.log("Admin auth error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default adminAuth;
