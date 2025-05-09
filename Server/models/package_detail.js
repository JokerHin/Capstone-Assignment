import mongoose from "mongoose";

const PackageDetailSchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    detail: { type: String, required: true },
  },
  {
    collection: "package_detail",
  }
);

const PackageDetail = mongoose.model("PackageDetail", PackageDetailSchema);

export default PackageDetail;
