import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    location_id: { type: Number, required: true },
    name: { type: String, required: true },
    coordinates: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    // Any other location properties...
  },
  {
    collection: "location", // Explicitly set the collection name
  }
);

const Location = mongoose.model("Location", LocationSchema);

export default Location;
