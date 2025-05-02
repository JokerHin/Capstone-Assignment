import mongoose from "mongoose";

const QuestSchema = new mongoose.Schema(
  {
    quest_id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    name: { type: String },
    description: { type: String },
  },
  {
    collection: "quest", // Explicitly set the collection name
  }
);

const Quest = mongoose.model("Quest", QuestSchema);

export default Quest;
