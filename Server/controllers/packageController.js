import Package from "../models/package.js";

// Get all packages
export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get package by ID
export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const packageData = await Package.findOne({ package_id: id });

    if (!packageData) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    res.status(200).json({ success: true, package: packageData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get packages by subquest ID
export const getPackagesBySubquest = async (req, res) => {
  try {
    const { subquestId } = req.params;
    const packages = await Package.find({ subquest_id: subquestId });

    res.status(200).json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new package
export const createPackage = async (req, res) => {
  try {
    const { package_id, subquest_id, name } = req.body;

    // Check if package already exists
    const existingPackage = await Package.findOne({ package_id });
    if (existingPackage) {
      return res.status(400).json({
        success: false,
        message: "Package with this ID already exists",
      });
    }

    const newPackage = new Package({
      package_id,
      subquest_id,
      name,
    });

    await newPackage.save();

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      package: newPackage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a package
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedPackage = await Package.findOneAndUpdate(
      { package_id: id },
      updates,
      { new: true }
    );

    if (!updatedPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    res.status(200).json({
      success: true,
      message: "Package updated successfully",
      package: updatedPackage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a package
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPackage = await Package.findOneAndDelete({ package_id: id });

    if (!deletedPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    res.status(200).json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
