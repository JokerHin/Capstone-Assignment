import mongoose from "mongoose";

const DialogueSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    dialogue_id: { type: String, required: true },
    subquest_id: { type: String },
    order: { type: Number, default: 0 },
  },
  {
    collection: "dialogue",
    timestamps: true, // Add createdAt and updatedAt fields
  }
);

const Dialogue = mongoose.model("Dialogue", DialogueSchema);

export default Dialogue;
