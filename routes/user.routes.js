import express from "express";
import { isAuthenticated, validateRole } from "../middlewares/auth.js";
import {
    logoutUser,
    registerUser,
    updateAccessToken,
    loginUser,
    activateUser,
    getUserInfo,
    socialAuth,
    updateUserInfo,
    updatePassword,
    updateAvatar,
    // getAllUsers,
    // updateUserRole,
    // deleteUser
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/activate", activateUser);
router.post("/login", loginUser);
router.get("/logout", isAuthenticated, logoutUser);
router.get("/refresh", updateAccessToken);
router.get("/me", isAuthenticated, getUserInfo);
router.post("/social", socialAuth);
router.put("/update-info", isAuthenticated, updateUserInfo);
router.put("/update-password", isAuthenticated, updatePassword);
router.put("/update-avatar", isAuthenticated, updateAvatar);
/*
router.get("/get-all-users", isAuthenticated,validateRole("admin"),getAllUsers);
router.put("/update-user-role", isAuthenticated,validateRole("admin"),updateUserRole);
router.delete("/delete-user/:id", isAuthenticated,validateRole("admin"),deleteUser);
*/

export default router;
