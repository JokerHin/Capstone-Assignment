import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";
import userModel from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login as admin",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.adminId) {
        const admin = await adminModel.findById(decoded.adminId);
        if (!admin) {
          return res.status(401).json({
            success: false,
            message: "Admin not found",
          });
        }

        req.admin = admin._id;
        req.isAdmin = true;
        next();
      } else if (decoded.userId) {
        const user = await userModel.findById(decoded.userId);
        if (!user || user.userType !== "admin") {
          return res.status(401).json({
            success: false,
            message: "Not authorized as admin",
          });
        }

        req.user = user._id;
        req.isAdmin = true;
        next();
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid token format",
        });
      }
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
