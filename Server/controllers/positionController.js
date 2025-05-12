import Position from "../models/position.js";

// Get all positions
export const getPositions = async (req, res) => {
  try {
    const positions = await Position.find();
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get position by ID
export const getPositionById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    res.json(position);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find positions by subquest ID
export const getPositionsBySubquest = async (req, res) => {
  try {
    const { subquestId } = req.params;
    const positions = await Position.find({ subquest_id: subquestId });
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a position
export const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedPosition = await Position.findOneAndUpdate(
      { position_id: id },
      updates,
      { new: true }
    );

    if (!updatedPosition) {
      return res
        .status(404)
        .json({ success: false, message: "Position not found" });
    }

    res.status(200).json({
      success: true,
      message: "Position updated successfully",
      position: updatedPosition,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a position
export const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Position.deleteOne({ position_id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Position not found" });
    }

    res.status(200).json({ success: true, message: "Position deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
