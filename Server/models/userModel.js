import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  location_id: {
    type: String,
    default: "0",
  },
  coordinates: {
    x: {
      type: Number,
      default: 672,
    },
    y: {
      type: Number,
      default: 185,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userModal = mongoose.models.user || mongoose.model("user", userSchema);

export default userModal;
