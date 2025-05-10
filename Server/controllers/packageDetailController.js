import PackageDetail from "../models/package_detail.js";

// Get all package details
export const getPackageDetails = async (req, res) => {
  try {
    const packageDetails = await PackageDetail.find();
    res.status(200).json({ success: true, packageDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get package details by package ID
export const getPackageDetailsByPackageId = async (req, res) => {
  try {
    const { packageId } = req.params;
    const packageDetails = await PackageDetail.find({ package_id: packageId });

    res.status(200).json({ success: true, packageDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new package detail
export const createPackageDetail = async (req, res) => {
  try {
    const { package_id, item_id, amount } = req.body;

    const newPackageDetail = new PackageDetail({
      package_id,
      item_id,
      amount,
    });

    await newPackageDetail.save();

    res.status(201).json({
      success: true,
      message: "Package detail created successfully",
      packageDetail: newPackageDetail,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a package detail
export const updatePackageDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedPackageDetail = await PackageDetail.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedPackageDetail) {
      return res
        .status(404)
        .json({ success: false, message: "Package detail not found" });
    }

    res.status(200).json({
      success: true,
      message: "Package detail updated successfully",
      packageDetail: updatedPackageDetail,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a package detail
export const deletePackageDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPackageDetail = await PackageDetail.findByIdAndDelete(id);

    if (!deletedPackageDetail) {
      return res
        .status(404)
        .json({ success: false, message: "Package detail not found" });
    }

    res.status(200).json({
      success: true,
      message: "Package detail deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete all package details for a package
export const deletePackageDetailsByPackageId = async (req, res) => {
  try {
    const { packageId } = req.params;

    const result = await PackageDetail.deleteMany({ package_id: packageId });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} package details deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
