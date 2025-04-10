import userModal from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
  try {
    const user = await userModal.findById(req.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.userType !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Admin authorization failed",
      error: error.message,
    });
  }
};

export default adminAuth;
