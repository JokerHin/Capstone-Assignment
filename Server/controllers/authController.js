import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import transporter from "../config/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

export const register = async (req, res) => {
  const { name, email, password, userType = "user" } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      userType,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to JokerHins Website",
      text: `Hello ${name}, welcome to my Website. Your account has been created successfully.`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      userData: { name: user.name, userType: user.userType },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, isAdminLogin } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Admin login path
    if (isAdminLogin) {
      // Try to find admin in admin collection
      const admin = await adminModel.findOne({ email });

      // If admin not found in admin collection, check if there's a user with admin privileges
      if (!admin) {
        const user = await userModel.findOne({ email, userType: "admin" });

        if (!user) {
          return res.json({
            success: false,
            message: "Invalid admin credentials",
          });
        }

        // Check password for user with admin privileges
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.json({
            success: false,
            message: "Invalid admin credentials",
          });
        }

        // Generate JWT token for user with admin privileges
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        // Set token as cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        // Return success response
        return res.json({
          success: true,
          message: "Admin login successful",
          userData: {
            name: user.name,
            email: user.email,
            userType: "admin",
          },
        });
      }

      // Check password for admin from admin collection
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      // Update last login time
      admin.lastLogin = Date.now();
      await admin.save();

      // Generate JWT token for admin
      const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // Set token as cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      // Return success response
      return res.json({
        success: true,
        message: "Admin login successful",
        userData: {
          name: admin.name,
          email: admin.email,
          userType: "admin",
          role: admin.role,
        },
      });
    } else {
      // Regular user login
      const user = await userModel.findOne({ email });

      // If user not found
      if (!user) {
        return res.json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // Set token as cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      // Return success response
      return res.json({
        success: true,
        message: "Login successful",
        userData: {
          name: user.name,
          email: user.email,
          userType: user.userType,
        },
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Send Verification OP to the User's Email
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account is already verified",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. Verify your account using this OTP.`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Verification OTP sent on Email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Verify the Email using the OTP
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Check if the user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Determine if this is a user or admin token
      if (decoded.userId) {
        const user = await userModel.findById(decoded.userId);
        if (!user) {
          return res
            .status(401)
            .json({ success: false, message: "User not found" });
        }

        return res.json({
          success: true,
          userData: {
            name: user.name,
            email: user.email,
            userType: user.userType,
          },
        });
      } else if (decoded.adminId) {
        const admin = await adminModel.findById(decoded.adminId);
        if (!admin) {
          return res
            .status(401)
            .json({ success: false, message: "Admin not found" });
        }

        return res.json({
          success: true,
          userData: {
            name: admin.name,
            email: admin.email,
            userType: "admin",
            role: admin.role,
          },
        });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Invalid token format" });
      }
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Send Password Reset OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for ressetting your password is ${otp}.
            Use this ITP to proceed with ressetting your password.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Reset User Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
