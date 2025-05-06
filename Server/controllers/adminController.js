import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import bcrypt from "bcryptjs";

// Completely revised admin authentication function
const isAdmin = async (req, res) => {
  try {
    // Get email from various sources in priority order
    const email =
      req.headers["admin-email"] ||
      req.query.email ||
      req.cookies?.email ||
      req.body?.email;

    // Get password if provided
    const password =
      req.headers["admin-password"] || req.query.password || req.body?.password;

    if (!email) {
      console.log("No email found in request");
      return {
        valid: false,
        status: 401,
        message: "Authentication required",
      };
    }

    console.log(`Checking admin privileges for: ${email}`);

    // First check if it's in the admin model
    const admin = await adminModel.findOne({ email });
    if (admin) {
      // If password is provided, verify it
      if (password) {
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return {
            valid: false,
            status: 401,
            message: "Invalid admin credentials",
          };
        }
      }

      console.log(`User found in admin model: ${email}`);
      return { valid: true, admin };
    }

    console.log(`User doesn't have admin privileges: ${email}`);
    return {
      valid: false,
      status: 403,
      message: "Admin privileges required",
    };
  } catch (error) {
    console.error("Error in admin authentication:", error);
    return {
      valid: false,
      status: 500,
      message: error.message,
    };
  }
};

// Get user statistics for admin dashboard
export const getUserStats = async (req, res) => {
  try {
    // Check if the user is an admin
    const adminCheck = await isAdmin(req, res);
    if (!adminCheck.valid) {
      return res.status(adminCheck.status).json({
        success: false,
        message: adminCheck.message,
      });
    }

    // Continue with original function logic
    const totalUsers = await userModel.countDocuments();

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const monthlyStats = await userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.json({
      success: true,
      totalUsers,
      monthlyStats,
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const adminCheck = await isAdmin(req, res);
    if (!adminCheck.valid) {
      return res.status(adminCheck.status).json({
        success: false,
        message: adminCheck.message,
      });
    }

    console.log("Get all users request:", {
      query: req.query,
      headers: {
        "admin-email": req.headers["admin-email"],
        authorization: req.headers["authorization"] ? "Present" : "Missing",
      },
    });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalUsers = await userModel.countDocuments();

    const users = await userModel
      .find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Found ${users.length} users`);

    return res.json({
      success: true,
      users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    // Check if the user is an admin
    const adminCheck = await isAdmin(req, res);
    if (!adminCheck.valid) {
      return res.status(adminCheck.status).json({
        success: false,
        message: adminCheck.message,
      });
    }

    const user = await userModel.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    console.log("Update User Request:", {
      params: req.params,
      body: req.body,
      cookies: req.cookies,
      headers: {
        "admin-email": req.headers["admin-email"],
        authorization: req.headers["authorization"] ? "Present" : "Missing",
      },
    });

    // Check if the user is an admin
    const adminCheck = await isAdmin(req, res);
    if (!adminCheck.valid) {
      console.log("Admin check failed:", adminCheck.message);
      return res.status(adminCheck.status).json({
        success: false,
        message: adminCheck.message,
      });
    }

    const { id } = req.params;
    const { name, password } = req.body;
    console.log(`Admin attempting to update user with ID: ${id}`);

    const user = await userModel.findById(id);
    if (!user) {
      console.log(`User with ID ${id} not found`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Admin updateUser error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
  try {
    // Debug the request to see what's coming in
    console.log("Delete User Request:", {
      params: req.params,
      cookies: req.cookies,
      headers: {
        "admin-email": req.headers["admin-email"],
        authorization: req.headers["authorization"] ? "Present" : "Missing",
      },
    });

    // Check if the user is an admin
    const adminCheck = await isAdmin(req, res);
    if (!adminCheck.valid) {
      console.log("Admin check failed:", adminCheck.message);
      return res.status(adminCheck.status).json({
        success: false,
        message: adminCheck.message,
      });
    }

    const user = await userModel.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Add User function
export const addUser = async (req, res) => {
  try {
    // Log request details for debugging
    console.log("Add User Request:", {
      body: req.body,
      cookies: req.cookies,
      headers: {
        "admin-email": req.headers["admin-email"],
        authorization: req.headers["authorization"] ? "Present" : "Missing",
      },
    });

    // Check if the user is an admin
    const adminCheck = await isAdmin(req, res);
    if (!adminCheck.valid) {
      return res.status(adminCheck.status).json({
        success: false,
        message: adminCheck.message,
      });
    }

    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with simplified schema
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    console.log("User created successfully:", {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      userData: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};
