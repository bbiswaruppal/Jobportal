import express from "express";

import {
  login,
  register,
  logout,
  updateProfile,
  getProfile,
  updateProfilePicture,
} from "../controllers/user.controller.js";

import authenticateToken from "../middleware/isAuthenticated.js";
import upload, { uploadProfilePicture } from "../middleware/upload.js";

const router = express.Router();

// Register a new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Logout user
router.post("/logout", logout);

// Get the logged-in user's profile
router.get("/profile", authenticateToken, getProfile);

// Update profile and upload or replace resume
router.post(
  "/profile/update",
  authenticateToken,
  upload.single("resume"),
  updateProfile
);
// Upload or replace profile picture
router.post(
  "/profile/picture",
  authenticateToken,
  uploadProfilePicture.single("profilePicture"),
  updateProfilePicture
);

export default router;