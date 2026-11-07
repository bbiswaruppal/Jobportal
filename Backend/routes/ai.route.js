import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import isRecruiter from "../middleware/isRecruiter.js";

import {
  sendRecruiterMessage,
  generateJobDescription,
  generateInterviewQuestions,
  evaluateCandidate,
  analyzeResume,
} from "../controllers/ai.controller.js";

const router = express.Router();

// HireNova AI - Recruiter Chat
router.post("/chat", authenticateToken, isRecruiter, sendRecruiterMessage);

// AI Job Description Generator
router.post(
  "/generate-description",
  authenticateToken,
  isRecruiter,
  generateJobDescription,
);
// AI Interview Question Generator
router.post(
  "/generate-interview-questions",
  authenticateToken,
  isRecruiter,
  generateInterviewQuestions
);
// AI Candidate Evaluation
router.post(
  "/evaluate-candidate",
  authenticateToken,
  isRecruiter,
  evaluateCandidate
);
// AI Resume Analyzer
router.post("/analyze-resume", authenticateToken, isRecruiter, analyzeResume);

export default router;
