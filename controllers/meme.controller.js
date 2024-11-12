import Meme from "../models/meme.model.js";
import User from "../models/user.model.js";

// Create a new meme
export const createMeme = async (req, res) => {
  try {
    const { imageUrl, caption, tags } = req.body;
    const userId = req.user._id;

    const meme = new Meme({
      creator: userId,
      imageUrl,
      caption,
      tags,
    });

    await meme.save();
    res.status(201).json({
      success: true,
      message: "Meme created successfully",
      meme,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all memes
export const getAllMemes = async (req, res) => {
  try {
    const memes = await Meme.find().populate("creator", "username avatar");
    res.status(200).json({ success: true, memes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get memes by user
export const getMemesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const memes = await Meme.find({ creator: userId }).populate("creator", "username avatar");
    res.status(200).json({ success: true, memes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single meme by ID
export const getMemeById = async (req, res) => {
  try {
    const { memeId } = req.params;
    const meme = await Meme.findById(memeId).populate("creator", "username avatar");
    if (!meme) {
      return res.status(404).json({ success: false, message: "Meme not found" });
    }
    res.status(200).json({ success: true, meme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a meme (only by creator)
export const updateMeme = async (req, res) => {
  try {
    const { memeId } = req.params;
    const { caption, tags } = req.body;
    const meme = await Meme.findById(memeId);

    if (!meme) {
      return res.status(404).json({ success: false, message: "Meme not found" });
    }
    if (meme.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    meme.caption = caption || meme.caption;
    meme.tags = tags || meme.tags;

    await meme.save();
    res.status(200).json({ success: true, message: "Meme updated successfully", meme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a meme (only by creator or admin)
export const deleteMeme = async (req, res) => {
  try {
    const { memeId } = req.params;
    const meme = await Meme.findById(memeId);

    if (!meme) {
      return res.status(404).json({ success: false, message: "Meme not found" });
    }
    if (meme.creator.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await meme.remove();
    res.status(200).json({ success: true, message: "Meme deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Like or unlike a meme
export const toggleLikeMeme = async (req, res) => {
  try {
    const { memeId } = req.params;
    const userId = req.user._id;

    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({ success: false, message: "Meme not found" });
    }

    const isLiked = meme.likes.includes(userId);

    if (isLiked) {
      meme.likes = meme.likes.filter((id) => id.toString() !== userId.toString());
      await meme.save();
      res.status(200).json({ success: true, message: "Meme unliked", meme });
    } else {
      meme.likes.push(userId);
      await meme.save();
      res.status(200).json({ success: true, message: "Meme liked", meme });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a comment to a meme
export const addCommentToMeme = async (req, res) => {
  try {
    const { memeId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({ success: false, message: "Meme not found" });
    }

    const comment = {
      user: userId,
      text,
    };

    meme.comments.push(comment);
    await meme.save();

    res.status(201).json({ success: true, message: "Comment added", meme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a comment from a meme
export const deleteCommentFromMeme = async (req, res) => {
  try {
    const { memeId, commentId } = req.params;

    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({ success: false, message: "Meme not found" });
    }

    const comment = meme.comments.find((comment) => comment._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    meme.comments = meme.comments.filter((comment) => comment._id.toString() !== commentId);
    await meme.save();
    res.status(200).json({ success: true, message: "Comment deleted", meme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};