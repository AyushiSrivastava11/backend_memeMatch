import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  createMatch,
  getUserMatches,
  deleteMatch,
  acceptMatch,
  rejectMatch,
  getMutualMatches
} from "../controllers/match.controller.js";

const router = express.Router();

router.post("/create-match", isAuthenticated, createMatch);
router.get("/get-user-matches/:userId", isAuthenticated, getUserMatches);
router.delete("/delete-match/:matchId", isAuthenticated, deleteMatch);
router.patch("/accept-match/:matchId", isAuthenticated, acceptMatch);
router.patch("/reject-match/:matchId", isAuthenticated, rejectMatch);
router.get("/get-mutual-matches/:userId", isAuthenticated, getMutualMatches);

export default router;
