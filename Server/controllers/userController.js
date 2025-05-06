import userModal from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const getUserData = async (req, res) => {
  try {
    // Get user credentials from request body instead of middleware
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await userModal.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Return user data
    res.json({
      success: true,
      userData: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Error getting user data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email, password, name, currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await userModal.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // If password is being changed, validate current password again
    if (newPassword) {
      // Current password should match the password submitted for authentication
      const passwordsMatch =
        currentPassword === password ||
        (await bcrypt.compare(currentPassword, user.password));

      if (!passwordsMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Incorrect current password" });
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    await user.save();
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
