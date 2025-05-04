import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import inventoryRouter from "./routes/inventoryRoutes.js";
import locationRouter from "./routes/locationRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import actionRouter from "./routes/actionRoutes.js";
import packageDetailRouter from "./routes/packageDetailRoutes.js";
import dialogueRouter from "./routes/dialogueRoutes.js";
import positionRouter from "./routes/positionRoutes.js";
import subquestRouter from "./routes/subquestRoutes.js";
import packageRouter from "./routes/packageRoutes.js";
import choiceRouter from "./routes/choiceRoutes.js";
import questRouter from "./routes/questRoutes.js";
import playerProgressRouter from "./routes/playerProgressRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
  "https://capstone-assignment.vercel.app",
  "https://the-codyssey.vercel.app",
  "https://codyssey-mongodb.vercel.app/dialogue",
  "https://data-bank-delta.vercel.app/",
  "http://127.0.0.1:5500",
];

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// API Endpoints
app.get("/", (req, res) => res.send("API Working"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/inventory", inventoryRouter);
app.use("/location", locationRouter);
app.use("/item", itemRouter);
app.use("/action", actionRouter);
app.use("/package_detail", packageDetailRouter);
app.use("/dialogue", dialogueRouter);
app.use("/position", positionRouter);
app.use("/subquest", subquestRouter);
app.use("/package", packageRouter);
app.use("/choice", choiceRouter);
app.use("/quest", questRouter);
app.use("/player_progress", playerProgressRouter);

app.listen(port, () => console.log(`Server is running on port ${port}`));
