import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["message", "like", "comment", "share"],
      required: true,
    },
    content: { type: String, maxlength: 500 }, // Content of the interaction, if applicable
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const matchSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },
    matchedInterests: {
      type: [String],
      default: [],
    },
    interactions: [interactionSchema],
    lastInteraction: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchSchema);
export default Match;
