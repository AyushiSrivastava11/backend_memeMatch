import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes.js";
import memeRouter from "./routes/meme.routes.js";
import matchRouter from "./routes/match.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import { connectDB } from "./utils/db.js";
import { v2 as cloudinary } from "cloudinary";
const app = express();
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SECRET_KEY,
});
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/meme", memeRouter);
app.use("/api/v1/match", matchRouter);
app.use("/api/v1/notifcation", notificationRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  connectDB();
});
