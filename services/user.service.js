import User from "../models/user.model.js";

export const getUserById = async(res, id) => {
    const user = await User.findById(id);
    res.status(200).json({
      success: true,
      user,
    });
  };
  