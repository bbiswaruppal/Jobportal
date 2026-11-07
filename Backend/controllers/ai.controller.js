
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Common AI response function
const generateAIResponse = async (systemPrompt, userPrompt) => {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return completion.choices[0].message.content;
};

// General Recruiter Chat
export const sendRecruiterMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 2000 characters.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Groq API key is not configured.",
      });
    }

    const reply = await generateAIResponse(
      `You are HireNova AI, a professional AI Hiring Assistant.
       Help recruiters with recruitment advice, job descriptions,
       interview questions, candidate evaluation guidance and hiring strategies.
       Be professional, friendly and concise.
       Never make final hiring decisions.
       Never recommend rejecting candidates based on protected characteristics.`,
      message.trim()
    );

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("HireNova AI Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "HireNova AI could not process your request.",
    });
  }
};

// AI Job Description Generator
export const generateJobDescription = async (req, res) => {
  try {
    const {
      jobTitle,
      experience,
      location,
      jobType,
      skills,
    } = req.body;

    if (!jobTitle || !jobTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title is required.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Groq API key is not configured.",
      });
    }

    const prompt = `
      Generate a professional job description using these details:

      Job Title: ${jobTitle}
      Experience: ${experience || "Not specified"}
      Location: ${location || "Not specified"}
      Job Type: ${jobType || "Not specified"}
      Required Skills: ${skills || "Suggest relevant skills"}

      Include:
      1. Job Overview
      2. Key Responsibilities
      3. Required Skills
      4. Qualifications
      5. Experience Requirements

      Use clear professional language.
      Do not invent company-specific information.
      Return a well-formatted job description.
    `;

    const description = await generateAIResponse(
      "You are HireNova AI, an expert recruitment and job description writer.",
      prompt
    );

    return res.status(200).json({
      success: true,
      description,
    });
  } catch (error) {
    console.error("Job Description Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to generate job description.",
    });
  }
};


// ======================AI Interview Question Generator================================
export const generateInterviewQuestions = async (req, res) => {
  try {
    const { jobTitle, skills, experience, questionCount } = req.body;

    if (!jobTitle || typeof jobTitle !== "string" || !jobTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title is required.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Groq API key is not configured.",
      });
    }

    const count = Math.min(
      Math.max(Number(questionCount) || 10, 1),
      20
    );

    const prompt = `
      Generate ${count} interview questions for this job:

      Job Title: ${jobTitle}
      Required Skills: ${skills || "Suggest relevant skills"}
      Experience: ${experience || "Not specified"}

      Include a balanced mix of:
      1. Technical questions
      2. Practical coding or problem-solving questions
      3. Conceptual questions
      4. HR or behavioral questions

      For every question, provide:
      - Question
      - A sample answer
      - Difficulty level (Easy, Medium, Hard)

      Number the questions clearly.
      Keep answers accurate, useful and concise.
      Do not make hiring decisions based on protected characteristics.
    `;

    const questions = await generateAIResponse(
      "You are HireNova AI, an expert technical interviewer and recruitment assistant.",
      prompt
    );

    return res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("Interview Question Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to generate interview questions.",
    });
  }
};


// AI Candidate Evaluation
export const evaluateCandidate = async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Groq API key is not configured.",
      });
    }

    const { Application } = await import(
      "../models/application.model.js"
    );

    const application = await Application.findById(applicationId)
      .populate("job")
      .populate("applicant");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    if (!application.job || !application.applicant) {
      return res.status(404).json({
        success: false,
        message: "Job or applicant information not found.",
      });
    }

    // Only the recruiter who created the job can evaluate
    if (
      application.job.created_by.toString() !== req.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to evaluate this candidate.",
      });
    }

    const candidate = application.applicant;
    const job = application.job;

    const prompt = `
      Evaluate this candidate against the job requirements.

      JOB DETAILS:
      Job Title: ${job.title}
      Required Skills: ${job.requirements.join(", ")}
      Required Experience: ${job.experience} years
      Job Description: ${job.description}

      CANDIDATE DETAILS:
      Name: ${candidate.fullName}
      Skills: ${(candidate.profile?.skills || []).join(", ")}
      Bio: ${candidate.profile?.bio || "Not provided"}
      Resume: ${candidate.resume || "Not provided"}

      APPLICATION STATUS: ${application.status}

      Provide a structured evaluation containing:

      1. Skills Match
      2. Matching Skills
      3. Missing or Unverified Skills
      4. Experience Assessment
      5. Candidate Strengths
      6. Areas for Improvement
      7. Interview Recommendation

      Be objective and evidence-based.
      Do not invent candidate information.
      If information is missing, clearly mention it.
      Do not make a final hiring decision.
      Never evaluate based on protected personal characteristics.

      Return a professional, readable report.
    `;

    const evaluation = await generateAIResponse(
      "You are HireNova AI, an objective recruitment evaluation assistant.",
      prompt
    );

    return res.status(200).json({
      success: true,
      candidateName: candidate.fullName,
      jobTitle: job.title,
      evaluation,
    });
  } catch (error) {
    console.error("Candidate Evaluation Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to evaluate candidate.",
    });
  }
};



export const analyzeResume = async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required",
      });
    }

    const { Application } = await import("../models/application.model.js");

    const application = await Application.findById(applicationId)
      .populate("job")
      .populate("applicant");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      !application.job ||
      !application.applicant ||
      application.job.created_by.toString() !== req.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to analyze this resume",
      });
    }

    const resumePath = application.applicant.resume;

    if (!resumePath || !fs.existsSync(resumePath)) {
      return res.status(404).json({
        success: false,
        message: "Candidate resume not found",
      });
    }

    const uploadsDir = path.resolve(process.cwd(), "uploads");
    const resolvedPath = path.resolve(resumePath);

    if (!resolvedPath.startsWith(uploadsDir + path.sep)) {
      return res.status(403).json({
        success: false,
        message: "Invalid resume file path",
      });
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    const pdfData = await pdfParse(fileBuffer);
    const resumeText = pdfData.text.trim();

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from this PDF",
      });
    }

    const prompt = `
Analyze this candidate's resume against the job requirements.

JOB TITLE: ${application.job.title}

JOB DESCRIPTION:
${application.job.description}

REQUIRED SKILLS:
${application.job.requirements.join(", ")}

CANDIDATE RESUME:
${resumeText.slice(0, 12000)}

Provide a structured report with:
1. Overall match percentage (estimate, not a definitive score)
2. Matching skills
3. Missing or unclear skills
4. Relevant experience and projects
5. Resume strengths
6. Areas for improvement
7. Suggested interview questions

Use only evidence available in the resume. Do not infer protected personal characteristics or make a hiring decision.
`;

    const analysis = await generateAIResponse(
      "You are an expert resume analyzer and technical recruiter. Give objective, evidence-based feedback.",
      prompt,
    );

    return res.status(200).json({
      success: true,
      candidateName: application.applicant.fullname,
      jobTitle: application.job.title,
      analysis,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
};

