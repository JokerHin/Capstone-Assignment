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
    collection: "subquests",
  }
);

const Subquest = mongoose.model("Subquest", SubquestSchema);

export default Subquest;
