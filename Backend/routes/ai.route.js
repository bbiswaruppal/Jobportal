import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import isRecruiter from "../middleware/isRecruiter.js";

import {
  sendRecruiterMessage,
  sendStudentMessage,
  generateJobDescription,
  generateInterviewQuestions,
  evaluateCandidate,
  analyzeResume,
  recommendStudentJobs,
  startMockInterview,
  evaluateMockInterview,
} from "../controllers/ai.controller.js";

import { analyzeATSResume } from "../controllers/ai.controller.js";
import uploadResume from "../middleware/uploadResume.js";

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
// HireNova AI - Student Chat
router.post("/student-chat", authenticateToken, sendStudentMessage);
// AI Job Recommendation for Students
router.get(
  "/student-job-recommendations",
  authenticateToken,
  recommendStudentJobs,
);
// AI Mock Interview for Students
router.post("/start-mock-interview", authenticateToken, startMockInterview);

// AI Mock Interview Evaluation for Students
router.post(
  "/evaluate-mock-interview",
  authenticateToken,
  evaluateMockInterview,
);

// AI Resume Analyzer for ATS
router.post(
  "/analyze-ats-resume",
  authenticateToken,
  uploadResume.single("resume"),
  analyzeATSResume,
);

export default router;
