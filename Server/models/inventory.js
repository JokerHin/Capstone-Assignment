import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    player_id: { type: String, required: true },
    item_id: { type: String, required: true },
    amount: { type: Number },
  },
  {
    collection: "inventory",
  }
);

const Inventory = mongoose.model("Inventory", InventorySchema);

export default Inventory;
