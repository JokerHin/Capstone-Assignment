import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false, // Changed from required: true
  },
  points: {
    type: Number,
    required: false, // Changed from required: true
    min: 0, // Changed from min: 1 to allow 0
  },
  rarity: {
    type: String,
    enum: ["common", "uncommon", "rare", "epic", "legendary"],
    default: "common",
  },
  game: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the 'updatedAt' field on save
achievementSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const achievementModel =
  mongoose.models.achievement ||
  mongoose.model("achievement", achievementSchema);

export default achievementModel;
