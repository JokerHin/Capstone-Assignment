import mongoose from "mongoose";

// email id should be unique
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
  resetOtp: {
    type: String,
    default: "",
  },
  resetOtExpireAt: {
    type: String,
    default: 0,
  },
  userType: {
    type: String,
    default: "user",
  },
});

const userModal = mongoose.models.user || mongoose.model("user", userSchema);

export default userModal;
