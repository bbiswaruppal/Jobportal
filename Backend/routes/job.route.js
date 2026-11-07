import express from "express";

import authenticateToken from "../middleware/isAuthenticated.js";
import {
  postJob,
  getAllJobs,
  getJobById,
  getAdminJobs,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(authenticateToken, postJob);
router.route("/get").get(getAllJobs);

router.route("/getadminjobs").get(authenticateToken, getAdminJobs);

router.route("/get/:id").get(authenticateToken, getJobById);

router.route("/update/:id").put(authenticateToken, updateJob);
router.route("/delete/:id").delete(authenticateToken, deleteJob);

export default router;
