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
