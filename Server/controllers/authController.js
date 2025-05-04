import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModal from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import transporter from "../config/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

// Helper function to set cookies based on environment
const setCookieOptions = (req) => {
  // Check if request is from production environment
  const isProduction =
    req.headers.origin && req.headers.origin.includes("vercel.app");

  return {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    domain: isProduction ? ".vercel.app" : undefined,
  };
};

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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie with proper options
    const cookieOptions = setCookieOptions(req);
    res.cookie("jwt", token, cookieOptions);

    // Sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to JokerHins Website",
      text: `Hello ${name}, welcome to my Website. Your account has been created successfully.`,
    };

    await transporter.sendMail(mailOptions);

    // Return token in body as well
    return res.json({
      success: true,
      userData: {
        name: user.name,
        userType: user.userType,
      },
      token, // Include token in response
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

    // Admin login path - only check admin collection
    if (isAdminLogin) {
      const admin = await adminModel.findOne({ email });
      const adminUser = !admin
        ? await userModal.findOne({ email, userType: "admin" })
        : null;

      if (!admin && !adminUser) {
        return res.json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      const target = admin || adminUser;

      // Check password
      const isMatch = await bcrypt.compare(password, target.password);
      if (!isMatch) {
        return res.json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      // Update last login time if it's a property
      if (target.lastLogin) {
        target.lastLogin = Date.now();
        await target.save();
      }

      // Generate JWT token with admin flag
      const token = jwt.sign(
        {
          id: target._id,
          userType: "admin", // Add userType to the token payload
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Set cookie and return token in body
      const cookieOptions = setCookieOptions(req);
      res.cookie("jwt", token, cookieOptions);

      return res.json({
        success: true,
        message: "Admin login successful",
        token,
        userData: {
          name: target.name,
          email: target.email,
          userType: "admin",
          role: target.role || "administrator",
        },
      });
    } else {
      // Regular user login - only check user collection
      const user = await userModal.findOne({ email });

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

      // Generate JWT token for regular user
      const token = jwt.sign(
        {
          id: user._id,
          userType: user.userType || "user", // Add userType to token payload
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Set cookie and return token in body
      const cookieOptions = setCookieOptions(req);
      res.cookie("jwt", token, cookieOptions);

      return res.json({
        success: true,
        message: "Login successful",
        token,
        userData: {
          name: user.name,
          email: user.email,
          userType: user.userType || "user",
        },
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
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
        const user = await userModal.findById(decoded.userId);
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
    const user = await userModal.findOne({ email });
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
    const user = await userModal.findOne({ email });
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

// Check if user is authenticated
export const isAuth = async (req, res) => {
  try {
    // Get token from cookies OR Authorization header
    let token = req.cookies.jwt;

    // If no token in cookies, check authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7, authHeader.length);
      } else {
        token = authHeader;
      }
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    let user;
    if (decoded.id) {
      user = await userModal.findById(decoded.id);
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Return user data
    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        userType: user.userType || "user",
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }
};

// Get current user data
export const me = async (req, res) => {
  try {
    // Get token from cookies OR Authorization header
    let token = req.cookies.jwt;

    // If no token in cookies, check authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7, authHeader.length);
      } else {
        token = authHeader;
      }
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    let user;
    if (decoded.id) {
      user = await userModal.findById(decoded.id);
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Return user data
    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        userType: user.userType || "user",
      },
    });
  } catch (error) {
    console.error("Get user data error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }
};
