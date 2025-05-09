import mongoose from "mongoose";

const DialogueSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    dialogue_id: { type: String, required: true },
    position_id: { type: String },
    package_id: { type: String },
    action_id: { type: String },
  },
  {
    collection: "dialogue",
    timestamps: true,
  }
);

const Dialogue = mongoose.model("Dialogue", DialogueSchema);

export default Dialogue;
