import Match from "../models/match.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

// Create a new match
export const createMatch = async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;

    if (!userId1 || !userId2) {
      return res.status(400).json({ message: "User IDs are required to create a match." });
    }

    // Check if the match already exists
    const existingMatch = await Match.findOne({
      $or: [
        { users: [userId1, userId2] },
        { users: [userId2, userId1] }
      ]
    });

    if (existingMatch) {
      return res.status(400).json({ message: "Match already exists." });
    }

    // Create a new match document
    const match = await Match.create({ users: [userId1, userId2] });

    // Create notifications for both users
    const users = await User.find({ _id: { $in: [userId1, userId2] } });
    users.forEach(async (user) => {
      await Notification.create({
        user: user._id,
        type: "match",
        content: `You have a new match with ${userId1 === user._id.toString() ? userId2 : userId1}`,
        relatedUser: userId1 === user._id.toString() ? userId2 : userId1,
      });
    });

    res.status(201).json({ success: true, match, message: "Match created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all matches for a user
export const getUserMatches = async (req, res) => {
  try {
    const userId = req.params.userId;

    const matches = await Match.find({ users: userId })
      .populate("users", "username avatar")
      .exec();

    res.status(200).json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a match
export const deleteMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    await match.deleteOne();
    res.status(200).json({ success: true, message: "Match deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a match request
export const acceptMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    match.status = "accepted";
    await match.save();

    res.status(200).json({ success: true, message: "Match accepted successfully", match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a match request
export const rejectMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    match.status = "rejected";
    await match.save();

    res.status(200).json({ success: true, message: "Match rejected successfully", match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get mutual matches between two users
export const getMutualMatches = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const matches1 = await Match.find({ users: userId1 }).select("users").exec();
    const matches2 = await Match.find({ users: userId2 }).select("users").exec();

    const mutualMatches = matches1.filter((m1) =>
      matches2.some((m2) => m2.users.includes(m1.users[0]) || m2.users.includes(m1.users[1]))
    );

    res.status(200).json({ success: true, mutualMatches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
