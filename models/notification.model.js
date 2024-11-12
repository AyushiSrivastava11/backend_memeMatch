import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["match", "message", "friend_request", "system", "alert"], // Define the type of notification
      required: true,
    },
    content: {
      type: String,
      required: true, // The content or message of the notification
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User who triggered the notification (e.g., sender of a message or match)
    },
    link: {
      type: String, // URL to redirect the user when the notification is clicked
      default: "",  // Could be used for linking to a match, profile, message, etc.
    },
    read: {
      type: Boolean,
      default: false, // To indicate whether the notification has been read by the user
    },
    timestamp: {
      type: Date,
      default: Date.now, // Automatically set the current date and time
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
