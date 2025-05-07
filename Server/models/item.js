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
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      required: true,
      enum: ["quest", "milestone", "badge", "currency"],
    },
    rarity: {
      type: String,
      enum: ["common", "uncommon", "rare", "epic", "legendary"],
      default: "common",
    },
    game: {
      type: String,
      default: "All Games",
    },
    points: {
      type: Number,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "item",
    timestamps: true,
  }
);

// Update the 'updatedAt' field on save
ItemSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Item = mongoose.model("Item", ItemSchema);

export default Item;
