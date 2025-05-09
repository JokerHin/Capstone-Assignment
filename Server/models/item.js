import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    item_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    collection: "item",
    timestamps: true,
  }
);

const Item = mongoose.model("Item", ItemSchema);

export default Item;
