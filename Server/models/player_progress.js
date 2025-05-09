import mongoose from "mongoose";

const PlayerProgressSchema = new mongoose.Schema(
  {
    player_id: { type: String, required: true },
    subquest_id: { type: String, required: true },
    status: { type: String },
  },
  {
    collection: "player_progress",
  }
);

const PlayerProgress = mongoose.model("PlayerProgress", PlayerProgressSchema);

export default PlayerProgress;
