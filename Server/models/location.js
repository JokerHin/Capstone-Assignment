import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    location_id: { type: Number, required: true },
    name: { type: String, required: true },
    coordinates: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
  },
  {
    collection: "location",
  }
);

const Location = mongoose.model("Location", LocationSchema);

export default Location;
