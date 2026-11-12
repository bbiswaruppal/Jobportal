import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import superAdminAuth from "../middleware/superAdminAuth.js";

import {
  createAdminRequest,
  getAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
} from "../controllers/adminRequest.controller.js";

const router = express.Router();

// Submit Admin Request
router.post("/", authenticateToken, createAdminRequest);

// View All Requests - Super Admin Only
router.get("/", authenticateToken, superAdminAuth, getAdminRequests);

// Approve Request - Super Admin Only
router.patch(
  "/:id/approve",
  authenticateToken,
  superAdminAuth,
  approveAdminRequest,
);

// Reject Request - Super Admin Only
router.patch(
  "/:id/reject",
  authenticateToken,
  superAdminAuth,
  rejectAdminRequest,
);

export default router;
