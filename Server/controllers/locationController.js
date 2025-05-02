import Location from "../models/location.js";

export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find(); // Fetch all locations
    res.json(locations);
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const addLocation = async (req, res) => {
  const locationData = req.body; // Get location data from the request body

  try {
    const newLocation = new Location(locationData); // Create a new Location instance
    await newLocation.save(); // Save the new location to the database
    res.status(201).json(newLocation); // Respond with the created location
  } catch (error) {
    res.status(400).json({ message: error.message }); // Handle errors
  }
};