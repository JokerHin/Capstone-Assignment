import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import adminModel from "../models/adminModel.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({
      email: "admin@example.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists!");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create new admin
    const newAdmin = new adminModel({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "super",
    });

    await newAdmin.save();

    console.log("Admin created successfully!");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
