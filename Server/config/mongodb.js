import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Database Connected"));

  await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`); // Connect to MongoDB with the database name of mern-auth
};

export default connectDB;
