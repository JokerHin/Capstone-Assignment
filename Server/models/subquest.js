import mongoose from "mongoose";

const SubquestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    quest_id: { type: String, required: true },
    subquest_id: { type: String, required: true },
    admin_id: { type: Number },
  },
  {
    collection: "subquest", // Explicitly set the collection name
    timestamps: true, // Add createdAt and updatedAt fields
  }
);

const Subquest = mongoose.model("Subquest", SubquestSchema);

export default Subquest;
