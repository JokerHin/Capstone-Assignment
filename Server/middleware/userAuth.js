import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";

const userAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.userId) {
        const user = await userModel.findById(decoded.userId);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: "User not found",
          });
        }

        req.user = user;
        next();
      } else if (decoded.adminId) {
        const admin = await adminModel.findById(decoded.adminId);
        if (!admin) {
          return res.status(401).json({
            success: false,
            message: "Admin not found",
          });
        }

        req.user = {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          userType: "admin",
        };
        req.admin = admin;
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

export default userAuth;
