import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Authenticated User
export const isAuthenticated = async (req, res, next) => {
  try {
    const access_token = req.cookies.access_token;

    if (!access_token) {
      return res.status(401).json({ message: "Please login to access this resource" });
    }
    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN);
    if (!decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
  }
};

// Validate user role
export const validateRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role || "")) {
     return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
};
