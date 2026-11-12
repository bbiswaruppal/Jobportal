import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import adminAuth from "../middleware/adminAuth.js";

import {
  getAdminDashboard,
  getAllUsers,
  deleteUser,
  getAllCompanies,
  deleteCompany,
  getAllJobs,
  deleteJob,
  getAllApplications,
  updateApplicationStatus,
  getAllAdmins,
  deleteAdmin,
} from "../controllers/admin.controller.js";
import superAdminAuth from "../middleware/superAdminAuth.js";

const router = express.Router();

// Admin Dashboard
router.get("/dashboard", authenticateToken, adminAuth, getAdminDashboard);

// Manage Users
router.get("/users", authenticateToken, adminAuth, getAllUsers);

router.delete("/users/:id", authenticateToken, adminAuth, deleteUser);

// Manage Companies
router.get("/companies", authenticateToken, adminAuth, getAllCompanies);

router.delete("/companies/:id", authenticateToken, adminAuth, deleteCompany);

// Manage Jobs
router.get("/jobs", authenticateToken, adminAuth, getAllJobs);

router.delete("/jobs/:id", authenticateToken, adminAuth, deleteJob);

// Manage Applications
router.get("/applications", authenticateToken, adminAuth, getAllApplications);

router.patch(
  "/applications/:id/status",
  authenticateToken,
  adminAuth,
  updateApplicationStatus,
);

// Super Admin - Manage Admins
router.get(
  "/admins",
  authenticateToken,
  superAdminAuth,
  getAllAdmins
);

// Super Admin - Delete Admin
router.delete(
  "/admins/:id",
  authenticateToken,
  superAdminAuth,
  deleteAdmin
);

export default router;
