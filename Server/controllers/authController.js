import bcrypt from "bcryptjs";
import userModal from "../models/userModel.js";
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
    const existingUser = await userModal.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModal({
      name,
      email,
      password: hashedPassword,
      userType,
    });
    await user.save();

    // Sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to The Codyssey",
      text: `Hello ${name}, welcome to The Codyssey. Your account has been created successfully.`,
    };

    await transporter.sendMail(mailOptions);

    // Return user data without token
    return res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, isAdminLogin } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (isAdminLogin) {
      // For admin login, check the adminModel first
      const admin = await adminModel.findOne({ email });

      if (admin) {
        const isMatch = await bcrypt.compare(password, admin.password);
        if (isMatch) {
          // Set email cookie for session tracking
          res.cookie("email", admin.email, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
          });

          // Return admin data
          return res.json({
            success: true,
            userData: {
              id: admin._id,
              name: admin.name || admin.email.split("@")[0],
              email: admin.email,
              userType: "admin", // Hardcoded for admins
            },
          });
        }
      }

      // If no admin found or password doesn't match, return error
      return res.status(403).json({
        success: false,
        message: "Admin access denied. Invalid credentials.",
      });
    } else {
      // Regular user login
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

      // Set email cookie for session tracking
      res.cookie("email", user.email, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      // Return user data (without userType and isAccountVerified)
      return res.json({
        success: true,
        userData: {
          id: user._id,
          name: user.name,
          email: user.email,
          // No userType or isAccountVerified
        },
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Send Verification OP to the User's Email
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModal.findById(userId);

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
    const user = await userModal.findById(userId);

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

// Send Password Reset OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModal.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Instead of storing OTP in database, set it in a cookie
    res.cookie("resetOtp", otp, {
      maxAge: 15 * 60 * 1000, // 15 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    // Store the email in a cookie to verify user later
    res.cookie("resetEmail", email, {
      maxAge: 15 * 60 * 1000, // 15 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    // Set expiry timestamp
    const expireAt = Date.now() + 15 * 60 * 1000;
    res.cookie("resetOtpExpireAt", expireAt.toString(), {
      maxAge: 15 * 60 * 1000, // 15 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for resetting your password is ${otp}.
            Use this OTP to proceed with resetting your password.`,
      html: PASSWORD_RESET_TEMPLATE
        ? PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
            "{{email}}",
            user.email
          )
        : `<p>Your OTP is: ${otp}</p>`,
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

  // Get OTP and expiry from cookies
  const storedOtp = req.cookies.resetOtp;
  const storedEmail = req.cookies.resetEmail;
  const expireAt = Number(req.cookies.resetOtpExpireAt || "0");

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
  }

  try {
    // Check if email matches the one provided during OTP request
    if (email !== storedEmail) {
      return res.json({ success: false, message: "Invalid email" });
    }

    // Check if OTP is valid
    if (!storedOtp || storedOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (expireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    const user = await userModal.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clear the cookies
    res.clearCookie("resetOtp");
    res.clearCookie("resetEmail");
    res.clearCookie("resetOtpExpireAt");

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get current user data
export const me = async (req, res) => {
  try {
    // Now we require credentials to be sent each time
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find the user
    const user = await userModal.findOne({ email });

    if (!user) {
      return res.status(401).json({
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

    // Return user data (without userType and isAccountVerified)
    return res.json({
      success: true,
      userData: {
        id: user._id,
        name: user.name,
        email: user.email,
        // No userType
      },
    });
  } catch (error) {
    console.error("Get user data error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
