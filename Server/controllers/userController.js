import userModal from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const getUserData = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModal.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      location_id: user.location_id,
      coordinates: user.coordinates,
    };

    return res.json({
      success: true,
      userData: userData,
    });
  } catch (error) {
    console.error("Error getting user data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log("Update profile request body:", req.body); // Add debug logging
    const { email, password, name, newPassword } = req.body;

    if (!email) {
      console.log("Email is missing in the request");
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModal.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only check password if changing something security-sensitive (like password)
    if (newPassword && password) {
      try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log("Password mismatch for email:", email);
          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }
      } catch (bcryptError) {
        console.error("Bcrypt compare error:", bcryptError);
        return res.status(500).json({
          success: false,
          message: "Error verifying password",
        });
      }
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Update password if provided
    if (newPassword) {
      try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
      } catch (hashError) {
        console.error("Password hashing error:", hashError);
        return res.status(500).json({
          success: false,
          message: "Error updating password",
        });
      }
    }

    // Save the user
    try {
      await user.save();
      console.log("User profile updated successfully for email:", email);
      res.json({ success: true, message: "Profile updated successfully" });
    } catch (saveError) {
      console.error("Error saving user:", saveError);
      res.status(500).json({
        success: false,
        message: "Error saving profile updates",
        error: saveError.message,
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserLocation = async (req, res) => {
  try {
    const { id, location_id, x, y } = req.body;

    if (!id || !location_id || x === undefined || y === undefined) {
      return res.status(400).json({
        success: false,
        message: "User ID, location_id, and coordinates (x, y) are required",
      });
    }

    const user = await userModal.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.location_id = location_id;
    user.coordinates = { x, y };

    await user.save();

    res.json({
      success: true,
      message: "Location updated successfully",
      data: {
        id: user._id,
        email: user.email,
        location_id: user.location_id,
        coordinates: user.coordinates,
      },
    });
  } catch (error) {
    console.error("Error updating user location:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
