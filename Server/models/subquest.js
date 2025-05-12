import mongoose from "mongoose";

const SubquestSchema = new mongoose.Schema(
  {
    subquest_id: { type: String, required: true },
    quest_id: { type: String, required: true },
    admin_id: { type: Number },
    title: { type: String, required: true },
    description: { type: String },
  },
  {
    collection: "subquests",
  }
);

const Subquest = mongoose.model("Subquest", SubquestSchema);

export default Subquest;
