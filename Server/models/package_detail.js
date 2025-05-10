import mongoose from "mongoose";

const PackageDetailSchema = new mongoose.Schema(
  {
    package_id: {
      type: String,
      required: true,
    },
    item_id: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "package_detail",
    timestamps: true,
  }
);

const PackageDetail = mongoose.model("PackageDetail", PackageDetailSchema);

export default PackageDetail;
