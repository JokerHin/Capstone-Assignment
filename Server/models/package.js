import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema(
  {
    package_id: { type: String, required: true, unique: true },
    subquest_id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    collection: "package",
    timestamps: true,
  }
);

const Package = mongoose.model("Package", PackageSchema);

export default Package;
