import jwt from "jsonwebtoken";
import sendMail from "../utils/sendMail.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.model.js";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt.js";
import cloudinary from "cloudinary";
import { getUserById } from "../services/user.service.js";
// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = { username, email, password };
    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;
    const data = { user: { username: user.username }, activationCode };

    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/activation-mail.ejs"),
      data
    );
    try {
      await sendMail({
        email: user.email,
        subject: "Account Activation",
        template: "activation-mail.ejs",
        data,
      });
      res.status(200).json({
        success: true,
        message: `Account activation email has been sent to ${user.email}`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Error sending email" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const createActivationToken = (user) => {
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET,
    {
      expiresIn: "10m",
    }
  );
  return { token, activationCode };
};

export const activateUser = async (req, res) => {
  try {
    const { activation_token, activation_code } = req.body;
    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
    if (newUser.activationCode !== activation_code) {
      return res.status(400).json({ message: "Invalid activation code" });
    }

    const { username, email, password } = newUser.user;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = new User({ username, email, password });
    await user.save();
    res
      .status(200)
      .json({ success: true, user, message: "Account has been activated" });

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body ;
    if(!email || !password){
      return res.status(400).json({message: "Please enter all fields"});
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    sendToken(user,200,res);
    
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


export const logoutUser = async (req, res, next) => {
  try {
    res.cookie("access_token", "");
    res.cookie("refresh_token", "");
    res.status(200).json({
      success: true,
      message: "Logged out",
    });
  } catch (error) {
    return next(new Error(error.message, 400));
  }
};

// Update Access Token
export const updateAccessToken = async (req, res, next) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    if(!refresh_token){
      return next(new Error("Please login to continue", 401));
    }

    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN);
    const message = "Could not refresh token";
    if (!decoded) {
      return next(new Error(message, 401));
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error(message, 401));
    }
    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
      expiresIn: "7d",
    });
    req.user = user;
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);
    res.status(200).json({
      status: "success",
      accessToken,
    });
  } catch (error) {
    return next(new Error(error.message, 400));
  }
};


// Get user info
export const getUserInfo = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return next(new Error("User ID is required", 400));
    }
    await getUserById(res, userId);
  } catch (error) {
    return next(new Error(error.message, 400));
  }
};

export const socialAuth = async (req, res, next) => {
  try {
    const {username, email, avatar } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const newUser = await User.create({username, email, avatar });
      sendToken(newUser, 200, res);
    } else {
      sendToken(user, 200, res);
    }
  } catch (error) {
    return next(new Error(error.message, 400));
  }
};


export const updateUserInfo = async (req, res, next) => {
  try {
    const {username } = req.body;
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (username && user) {
      user.username =username;
    }
    await user?.save();
    res.status(201).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    return next(new Error(error.message, 400));
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return next(new Error("Please enter old and new password", 400));
    }
    const user = await User.findById(req.user?._id).select("+password");
    if (user?.password === undefined) {
      return next(new Error("User not found", 400));
    }
    const isPasswordMatched = await user?.comparePassword(oldPassword);
    if (!isPasswordMatched) {
      return next(new Error("Invalid Old Password", 400));
    }
    user.password = newPassword;
    user.save();
    res.status(201).json({
      status: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return next(new Error(error.message, 400));
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (avatar && user) {
      if (user?.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 150,
        });
        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      } else {
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 150,
        });
        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      await user?.save();
      res.status(201).json({
        success: true,
        message: "Avatar updated successfully",
        user,
      });
    }
  } catch (error) {
    return next(new Error(error.message, 400));
  }
};

/*
// Get all users --Admin
export const getAllUsers = async (req, res, next) => {
  try {
    getAllUsersService(res);
  } catch (error) {
    return next(new Error(error.message, 500));
  }
};

// Update user role --Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role, id } = req.body;
    updateUserRoleService(res, role, id);
  } catch (error) {
    return next(new Error(error.message, 400));
  }
};

// Delete user by admin
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return next(new Error("User not found", 404));
    await user.deleteOne({ id });
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return next(new Error(error.message, 500));
  }
};
*/