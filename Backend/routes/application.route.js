import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import {
  applyJob,
  getAppliedJobs,
  getApplicants,
  updateApplicationStatus,
} from "../controllers/application.controller.js";


const router = express.Router();

router.route("/apply/:id").post(authenticateToken, applyJob);
router.route("/get").get(authenticateToken, getAppliedJobs);

router.route("/:id/applicants").get(authenticateToken, getApplicants);

router.route("/status/:id/update").put(authenticateToken, updateApplicationStatus);

export default router;
