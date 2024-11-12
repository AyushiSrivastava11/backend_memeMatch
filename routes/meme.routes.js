import express from "express";
import { isAuthenticated, validateRole } from "../middlewares/auth.js";
import { createMeme,
     getAllMemes,
     getMemesByUser,
     getMemeById,
     updateMeme,
     deleteMeme,
     toggleLikeMeme,
     addCommentToMeme,
     deleteCommentFromMeme
     } from "../controllers/meme.controller.js";

const router = express.Router();
router.post("/create-meme", isAuthenticated,createMeme);
router.get("/getAllMemes",getAllMemes);
router.get("/getMemesByUser/:userId",isAuthenticated,getMemesByUser);
router.get("/getMemeById/:memeId",isAuthenticated,getMemeById);
router.put("/updateMeme/:memeId",isAuthenticated,updateMeme);
router.delete("/deleteMeme/:memeId",isAuthenticated,validateRole("admin"),deleteMeme);
router.put("/toggleLikeMeme/:memeId",isAuthenticated,toggleLikeMeme);
router.put("/addCommentToMeme/:memeId",isAuthenticated,addCommentToMeme);
router.put("/deleteCommentFromMeme/:memeId",isAuthenticated,validateRole("admin"),deleteCommentFromMeme);

export default router;
