import Groq from "groq-sdk";
import fs from "fs";
import mammoth from "mammoth";
import path from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { User } from "../models/user.model.js";
import { job as Job } from "../models/job.model.js";

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

    if (!message || typeof message !== "string" || !message.trim()) {
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
      message.trim(),
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
    const { jobTitle, experience, location, jobType, skills } = req.body;

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
      prompt,
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

    const count = Math.min(Math.max(Number(questionCount) || 10, 1), 20);

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
      prompt,
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

    const { Application } = await import("../models/application.model.js");

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
    if (application.job.created_by.toString() !== req.id.toString()) {
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
      prompt,
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

// HireNova AI - Student Career Assistant
export const sendStudentMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
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
      `You are HireNova AI, a friendly and professional
       Student Career Assistant.

       Help students with:
       1. Career guidance
       2. Job search advice
       3. Resume improvement
       4. Interview preparation
       5. Technical skills and learning roadmaps

       Give practical, accurate and easy-to-understand answers.
       Be supportive and concise.
       Never guarantee jobs or interview success.
       Do not invent job vacancies or company information.
       If information is uncertain, clearly say so.`,
      message.trim(),
    );

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Student AI Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "HireNova AI could not process your request.",
    });
  }
};

// HireNova AI - Student Job Recommendations
export const recommendStudentJobs = async (req, res) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Groq API key is not configured.",
      });
    }

    const student = await User.findById(userId).select("-password");

    console.log("Fetched Student Profile:", student?.profile);
    console.log("Fetched Student Skills:", student?.profile?.skills);

    if (!student || student.role !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access job recommendations.",
      });
    }

    const jobs = await Job.find()
      .populate("company", "name")
      .sort({ createdAt: -1 })
      .limit(50);
    console.log("Total Jobs Found:", jobs.length);

    if (!jobs.length) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        message: "No jobs are available right now.",
      });
    }

    const studentProfile = {
      name: student.fullname,
      bio: student.profile?.bio || "",
      skills: student.profile?.skills || [],
      resume: student.resume ? "Uploaded" : "Not uploaded",
    };

    console.log("Student Skills:", student.profile?.skills);
    console.log("Student Bio:", student.profile?.bio);

    const jobData = jobs.map((job) => ({
      id: job._id.toString(),
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      salary: job.salary,
      jobType: job.jobType,
      experience: job.experience,
      company: job.company?.name || "Company",
    }));

    const prompt = `
You are an intelligent job recommendation engine.

STUDENT PROFILE:
${JSON.stringify(studentProfile, null, 2)}

AVAILABLE JOBS:
${JSON.stringify(jobData, null, 2)}

TASK:
Analyze the student's skills and bio.
Compare them with the title, description and requirements
of every available job.

IMPORTANT RULES:
1. You MUST evaluate every available job.
2. Do not return an empty list if jobs are available.
3. Recommend the best matching jobs, even if the match is not perfect.
4. Give a match percentage between 40 and 100.
5. Consider transferable and related technical skills.
6. Do not assume experience that is not provided.
7. Return a maximum of 10 jobs.
8. Use only the exact job IDs provided.
9. Sort recommendations from highest to lowest match.

RETURN ONLY VALID JSON:
{
  "recommendations": [
    {
      "jobId": "exact job id",
      "matchPercentage": 85,
      "reason": "The student's skills match the job requirements."
    }
  ]
}
`;

    const aiResponse = await generateAIResponse(
      "You are HireNova AI, an intelligent job recommendation assistant. Return valid JSON only.",
      prompt,
    );

    console.log("AI RAW RESPONSE:", aiResponse);
    console.log("AI RESPONSE TYPE:", typeof aiResponse);

    const cleanedResponse = aiResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsedResponse = JSON.parse(cleanedResponse);

    const validRecommendations = (parsedResponse.recommendations || [])
      .filter((item) => jobData.some((job) => job.id === item.jobId))
      .slice(0, 10);

    const recommendations = validRecommendations.map((item) => {
      const job = jobs.find((j) => j._id.toString() === item.jobId);

      return {
        ...item,
        job,
      };
    });

    return res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Job Recommendation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate job recommendations.",
    });
  }
};


export const startMockInterview = async (req, res) => {
  try {
    const { role, experienceLevel } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Job role is required",
      });
    }

    const prompt = `
Generate 5 interview questions for a student preparing for the role of ${role}.

Experience Level: ${experienceLevel || "Fresher"}

Include:
1. Two technical questions
2. One practical coding or problem-solving question
3. One project-based question
4. One HR question

Return ONLY valid JSON in this format:
{
  "questions": [
    {
      "question": "Question text",
      "type": "Technical"
    }
  ]
}
`;

    const aiResponse = await generateAIResponse(
      "You are an experienced technical interviewer. Generate clear and relevant interview questions.",
      prompt,
    );

    const cleanedResponse = aiResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsedResponse = JSON.parse(cleanedResponse);

    return res.status(200).json({
      success: true,
      questions: parsedResponse.questions,
    });
  } catch (error) {
    console.error("Mock Interview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate interview questions",
    });
  }
};




export const evaluateMockInterview = async (req, res) => {
  try {
    const { role, questions, answers } = req.body;

    if (
      !role ||
      !Array.isArray(questions) ||
      !Array.isArray(answers) ||
      questions.length === 0 ||
      questions.length !== answers.length ||
      answers.some((answer) => !answer?.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please submit all interview answers.",
      });
    }

    const interviewData = questions.map((item, index) => ({
      question: item.question,
      type: item.type,
      answer: answers[index],
    }));

    const prompt = `
Evaluate this student's mock interview.

Job Role: ${role}

Interview:
${JSON.stringify(interviewData, null, 2)}

Evaluate technical knowledge, answer relevance, clarity and communication.

Return ONLY valid JSON:
{
  "overallScore": 75,
  "strengths": ["Good technical understanding"],
  "improvements": ["Explain concepts with examples"],
  "feedback": [
    {
      "question": "Question text",
      "score": 8,
      "feedback": "Detailed feedback"
    }
  ],
  "finalFeedback": "Overall interview feedback"
}

Scores must be between 0 and 10 for individual questions
and 0 and 100 for overallScore.
Be fair to fresher candidates.
`;

    const aiResponse = await generateAIResponse(
      "You are a professional interviewer and career coach. Evaluate answers fairly and provide constructive feedback.",
      prompt,
    );

    const cleanedResponse = aiResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleanedResponse);

    return res.status(200).json({
      success: true,
      evaluation: result,
    });
  } catch (error) {
    console.error("Interview Evaluation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to evaluate interview.",
    });
  }
};



export const analyzeATSResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF or DOCX resume.",
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const extension = fileName.split(".").pop().toLowerCase();

    let resumeText = "";

    if (extension === "pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text;
    } else if (extension === "docx") {
      const result = await mammoth.extractRawText({
        path: filePath,
      });

      resumeText = result.value;
    } else {
      return res.status(400).json({
        success: false,
        message: "Only PDF and DOCX files are supported.",
      });
    }

    resumeText = resumeText.trim();

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from this resume.",
      });
    }

    if (resumeText.length < 50) {
      return res.status(400).json({
        success: false,
        message: "Resume content is too short to analyze.",
      });
    }

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from this resume.",
      });
    }

    const prompt = `
You are an expert ATS resume evaluator.

Analyze the following resume and return an objective ATS report.

RESUME:
${resumeText.slice(0, 12000)}

Evaluate:
1. Resume formatting and structure
2. Contact information
3. Education
4. Technical skills
5. Projects and experience
6. Relevant keywords
7. Grammar and readability

Return ONLY valid JSON in this exact structure:

{
  "atsScore": 75,
  "strengths": ["Strong technical skills"],
  "weaknesses": ["Missing professional summary"],
  "missingKeywords": ["REST API", "Testing"],
  "suggestions": ["Add measurable project achievements"],
  "summary": "A short overall resume assessment"
}

Rules:
- atsScore must be an integer from 0 to 100.
- Evaluate only information present in the resume.
- Do not invent qualifications or experience.
- Be fair to freshers.
- Do not evaluate protected personal characteristics.
- Return JSON only, without markdown.
`;

    const aiResponse = await generateAIResponse(
      "You are HireNova AI, an expert ATS resume evaluator. Return valid JSON only.",
      prompt,
    );

    let atsReport;

    try {
      const cleanedResponse = aiResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

        console.log("ATS AI RAW RESPONSE:", aiResponse);
        console.log("ATS CLEANED RESPONSE:", cleanedResponse);

      atsReport = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("ATS JSON Parsing Error:", aiResponse);

      return res.status(500).json({
        success: false,
        message: "AI returned an invalid ATS report. Please try again.",
      });
    }

    if (
      !Number.isInteger(atsReport.atsScore) ||
      atsReport.atsScore < 0 ||
      atsReport.atsScore > 100
    ) {
      return res.status(500).json({
        success: false,
        message: "Invalid ATS score generated.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully.",
      atsReport,
    });
  } catch (error) {
    console.error("Resume Extraction Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to extract resume text.",
    });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Resume cleanup error:", cleanupError);
      }
    }
  }
};



