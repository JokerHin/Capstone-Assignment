import mongoose from "mongoose";

const PositionSchema = new mongoose.Schema(
  {
    position_id: { type: String, required: true },
    location_id: { type: String },
    subquest_id: { type: String },
    npc: { type: String },
    coordinates: { type: Object },
  },
  {
    collection: "position",
    timestamps: true,
  }
);

const Position = mongoose.model("Position", PositionSchema);

export default Position;
