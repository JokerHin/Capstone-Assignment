import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  location_id: { type: String, required: true },
  type: { type: String },
  spawn_position: { type: Object },
  entrance_position: { type: Object }
}, {
  collection: "location", // Explicitly set the collection name
});

const Location = mongoose.model("Location", LocationSchema);

export default Location;
