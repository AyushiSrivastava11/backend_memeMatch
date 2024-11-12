import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbURL = process.env.MONGO_URL || "";

export const connectDB = async()=>{
    try {
        await mongoose.connect(dbURL);
        console.log("Database connected successfully");
        
    } catch (error) {
        console.log(error.message);
    }
}