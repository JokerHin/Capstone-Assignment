import mongoose from "mongoose";

const ChoiceSchema = new mongoose.Schema(
  {
    choice_id: { type: String, required: true },
    dialogue_id: { type: String, required: true },
    package_id: { type: String },
    text: { type: String, required: true },
    respond: { type: String },
    alt_text: { type: String },
  },
  {
    collection: "choice",
  }
);

const Choice = mongoose.model("Choice", ChoiceSchema);

export default Choice;
