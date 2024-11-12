import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegexPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: [true, "Please enter your username"] },
        email: {
            type: String,
            required: [true, "Please enter your email"],
            validate: {
                validator: function (val) {
                    return emailRegexPattern.test(val);
                },
                message: "Please enter a valid email",
            },
            unique: true,
        },
        password: {
            type: String,
            minlength: [8, "Password must be at least 8 characters"],
            validate: {
                validator: function (val) {
                    return passwordRegexPattern.test(val);
                },
                message:
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            },
            select: false,
        },
        avatar: {
            public_id: { type: String },
            url: { type: String },
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        memeBoard: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Meme",
            },
        ],
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        bio: {
            type: String,
            maxlength: 250,
            default: "",
        },
        interests: [String],
        location: {
            city: String,
            country: String,
        },
        connectionRequests: [
            {
                fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                status: {
                    type: String,
                    enum: ["pending", "accepted", "rejected"],
                    default: "pending",
                },
            },
        ],
        lastLogin: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Hash Password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// Sign Access token
userSchema.methods.SignAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", { expiresIn: "15m" });
};

// Sign Refresh token
userSchema.methods.SignRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", { expiresIn: "7d" });
};

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
