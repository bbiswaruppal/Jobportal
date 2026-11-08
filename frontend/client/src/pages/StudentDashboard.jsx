import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../api.js";
import UpdateProfileDialog from "../components/UpdateProfileDialog.jsx";
import {
  MessageCircle,
  Send,
  Bot,
  X,
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { jsPDF } from "jspdf";

function StudentDashboard() {
  const [showJobs, setShowJobs] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // AI Job Recommendation States
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);

  const [showAppliedJobs, setShowAppliedJobs] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [appliedLoading, setAppliedLoading] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState("");

  // AI Mock Interview States
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [interviewRole, setInterviewRole] = useState("MERN Stack Developer");
  const [interviewLevel, setInterviewLevel] = useState("Fresher");
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewError, setInterviewError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState([]);

  const [evaluation, setEvaluation] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [evaluationError, setEvaluationError] = useState("");

  // Voice Interview States
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef(null);

  // AI ATS Resume Analyzer
  const [atsFile, setAtsFile] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsError, setAtsError] = useState("");
  const [atsReport, setAtsReport] = useState(null);

  // HireNova AI Student Assistant States
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm HireNova AI. I can help you with career guidance, job search, resume improvement and interview preparation. How can I help you today?",
    },
  ]);

  // Automatically fetch applications when dashboard loads
  useEffect(() => {
    const fetchDashboardApplications = async () => {
      try {
        const response = await API.get("/application/applied-jobs");

        if (response.data?.success) {
          setAppliedJobs(response.data.data || []);
        }
      } catch (error) {
        console.error("Dashboard applications fetch failed:", error);
      }
    };

    fetchDashboardApplications();
  }, []);

  // Fetch AI Job Recommendations
  const handleGetRecommendations = async () => {
    setRecommendationLoading(true);
    setRecommendationError("");
    setShowRecommendations(true);

    try {
      const response = await API.get("/ai/student-job-recommendations");

      if (response.data.success) {
        setRecommendations(response.data.recommendations || []);
      } else {
        setRecommendationError("Unable to load recommendations.");
      }
    } catch (error) {
      console.error("AI Recommendation Error:", error);

      setRecommendationError(
        error.response?.data?.message ||
          "Failed to generate job recommendations.",
      );
    } finally {
      setRecommendationLoading(false);
    }
  };

  // Start AI Mock Interview
  const handleStartMockInterview = async () => {
    setInterviewLoading(true);
    setInterviewError("");
    setInterviewQuestions([]);
    setInterviewAnswers([]);
    setCurrentQuestion(0);
    setShowMockInterview(true);

    try {
      const response = await API.post("/ai/start-mock-interview", {
        role: interviewRole,
        experienceLevel: interviewLevel,
      });

      if (response.data.success) {
        setInterviewQuestions(response.data.questions || []);
      } else {
        setInterviewError("Unable to generate interview questions.");
      }
    } catch (error) {
      console.error("Mock Interview Error:", error);

      setInterviewError(
        error.response?.data?.message || "Failed to start mock interview.",
      );
    } finally {
      setInterviewLoading(false);
    }
  };

  // Evaluate AI Mock Interview
  const handleEvaluateMockInterview = async () => {
    if (
      interviewAnswers.length !== interviewQuestions.length ||
      interviewAnswers.some((answer) => !answer?.trim())
    ) {
      setEvaluationError("Please answer all interview questions.");
      return;
    }

    setEvaluationLoading(true);
    setEvaluationError("");
    setEvaluation(null);

    try {
      const response = await API.post("/ai/evaluate-mock-interview", {
        role: interviewRole,
        questions: interviewQuestions,
        answers: interviewAnswers,
      });

      if (response.data.success) {
        setEvaluation(response.data.evaluation);
      } else {
        setEvaluationError("Unable to evaluate your interview.");
      }
    } catch (error) {
      console.error("Interview Evaluation Error:", error);

      setEvaluationError(
        error.response?.data?.message || "Failed to evaluate interview.",
      );
    } finally {
      setEvaluationLoading(false);
    }
  };

  // AI ATS Resume Analysis
  const handleAnalyzeATS = async () => {
    if (!atsFile) {
      setAtsError("Please select your resume first.");
      return;
    }

    const extension = atsFile.name.split(".").pop().toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setAtsError("Only PDF and DOCX files are allowed.");
      return;
    }

    if (atsFile.size > 5 * 1024 * 1024) {
      setAtsError("Resume size must be less than 5 MB.");
      return;
    }

    try {
      setAtsLoading(true);
      setAtsError("");
      setAtsReport(null);

      const formData = new FormData();
      formData.append("resume", atsFile);

      const response = await API.post("/ai/analyze-ats-resume", formData);

      setAtsReport(response.data.atsReport);
    } catch (error) {
      console.error("ATS Analysis Error:", error);

      setAtsError(
        error.response?.data?.message ||
          "Unable to analyze resume. Please try again.",
      );
    } finally {
      setAtsLoading(false);
    }
  };

  // Download ATS Report as PDF
  const handleDownloadATSReport = () => {
    if (!atsReport) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("HireNova - ATS Resume Report", 20, 20);

    doc.setFontSize(14);
    doc.text(`ATS Score: ${atsReport.atsScore}/100`, 20, 35);

    let y = 50;

    const addSection = (title, items) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.text(title, 20, y);
      y += 10;

      doc.setFontSize(10);

      items.forEach((item) => {
        const lines = doc.splitTextToSize(`- ${item}`, 165);

        if (y + lines.length * 6 > 275) {
          doc.addPage();
          y = 20;
        }

        doc.text(lines, 22, y);
        y += lines.length * 6;
      });

      y += 10;
    };

    addSection("Strengths", atsReport.strengths || []);
    addSection("Weaknesses", atsReport.weaknesses || []);
    addSection("Missing Keywords", atsReport.missingKeywords || []);
    addSection("Suggestions", atsReport.suggestions || []);

    doc.setFontSize(14);
    doc.text("Overall Assessment", 20, y);
    y += 8;

    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(
      atsReport.summary || "No summary available",
      165,
    );

    doc.text(summaryLines, 20, y);

    doc.save("HireNova-ATS-Report.pdf");
  };

  // Start Voice Recognition
  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setInterviewError(
        "Voice recognition is not supported. Please use Google Chrome.",
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setInterviewError("");
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;

      setInterviewAnswers((prev) => {
        const updatedAnswers = [...prev];
        const existingAnswer = updatedAnswers[currentQuestion] || "";

        updatedAnswers[currentQuestion] = existingAnswer
          ? `${existingAnswer} ${spokenText}`
          : spokenText;

        return updatedAnswers;
      });
    };

    recognition.onerror = (event) => {
      setInterviewError(`Voice recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // AI Speaks Interview Question
  const handleSpeakQuestion = () => {
    if (!("speechSynthesis" in window)) {
      setInterviewError("Voice output is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const question = interviewQuestions[currentQuestion]?.question;

    if (!question) return;

    const speech = new SpeechSynthesisUtterance(question);

    speech.lang = "en-IN";
    speech.rate = 0.9;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  // Stop AI Voice
  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  // Browse Jobs
  async function handleBrowseJobs() {
    if (showJobs) {
      setShowJobs(false);
      return;
    }

    setShowJobs(true);
    setLoading(true);
    setMessage("");
    setShowAppliedJobs(false);

    try {
      const response = await API.get("/job/get");

      if (response.data.success) {
        setJobs(response.data.jobs || []);
      } else {
        setJobs([]);
        setMessage("No jobs available right now.");
      }
    } catch (error) {
      setJobs([]);
      setMessage(error.response?.data?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }

  // Applied Jobs
  async function handleAppliedJobs() {
    if (showAppliedJobs) {
      setShowAppliedJobs(false);
      return;
    }

    setShowAppliedJobs(true);
    setAppliedLoading(true);
    setAppliedMessage("");
    setShowJobs(false);

    try {
      const response = await API.get("/application/applied-jobs");

      if (response.data.success) {
        setAppliedJobs(response.data.data || []);
      } else {
        setAppliedJobs([]);
        setAppliedMessage("No applied jobs found.");
      }
    } catch (error) {
      setAppliedJobs([]);
      setAppliedMessage(
        error.response?.data?.message || "Failed to load applied jobs.",
      );
    } finally {
      setAppliedLoading(false);
    }
  }

  // Send Message to HireNova AI
  const handleSendAIMessage = async (e) => {
    e.preventDefault();

    const message = chatMessage.trim();

    if (!message || chatLoading) return;

    setChatMessages((prev) => [...prev, { role: "user", content: message }]);

    setChatMessage("");
    setChatLoading(true);

    try {
      const response = await API.post("/ai/student-chat", {
        message,
      });

      if (response.data.success) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.data.reply,
          },
        ]);
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.response?.data?.message ||
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Apply for a Job
  async function handleApplyJob(jobId) {
    try {
      const response = await API.post(`/application/apply/${jobId}`);

      alert(response.data.message || "Application submitted successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to apply for this job.");
    }
  }

  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "accepted") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (normalizedStatus === "rejected") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  const pendingCount = appliedJobs.filter(
    (item) => item.status?.toLowerCase() === "pending",
  ).length;

  const acceptedCount = appliedJobs.filter(
    (item) => item.status?.toLowerCase() === "accepted",
  ).length;

  const rejectedCount = appliedJobs.filter(
    (item) => item.status?.toLowerCase() === "rejected",
  ).length;

  const formatDate = (date) => {
    if (!date) return "Recently posted";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white shadow-lg md:p-9">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-3 text-sm font-semibold tracking-wider text-blue-100">
              STUDENT WORKSPACE
            </p>

            <h1 className="text-2xl font-bold md:text-4xl">
              Welcome to Your Dashboard!
            </h1>

            <p className="mt-3 text-sm leading-6 text-blue-100 md:text-base">
              Explore opportunities, track your applications and take the next
              step in your career journey.
            </p>

            <button
              onClick={handleBrowseJobs}
              className="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              Explore Jobs →
            </button>
          </div>

          <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 right-40 h-72 w-72 rounded-full bg-white/5" />
        </section>

        {/* HireNova AI Assistant */}
        <section className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 p-6 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md">
                <Bot size={30} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Meet HireNova AI
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Your personal AI career assistant. Ask anything about your
                  career.
                </p>
              </div>
            </div>

            {/* AI ATS Resume Analyzer */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <FileText className="text-purple-600" size={26} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    AI ATS Resume Analyzer
                  </h2>
                  <p className="text-sm text-gray-500">
                    Analyze your resume and get an AI-powered ATS score.
                  </p>
                </div>
              </div>

              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => {
                  setAtsFile(e.target.files[0] || null);
                  setAtsError("");
                  setAtsReport(null);
                }}
                className="block w-full text-sm mt-4"
              />

              {atsFile && (
                <p className="text-sm text-green-600 mt-3">
                  Selected: {atsFile.name}
                </p>
              )}

              {atsError && (
                <p className="text-red-500 text-sm mt-3">{atsError}</p>
              )}

              <button
                onClick={handleAnalyzeATS}
                disabled={atsLoading || !atsFile}
                className="w-full mt-5 bg-purple-600 text-white py-3 rounded-xl disabled:opacity-50"
              >
                {atsLoading ? "Analyzing..." : "Analyze My Resume"}
              </button>
            </div>

            <button
              onClick={() => setShowAIChat(true)}
              className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
            >
              <span className="flex items-center gap-2">
                <MessageCircle size={18} />
                Chat with AI
              </span>
            </button>
          </div>
        </section>
        <section className="mt-8">
          {/* ATS Analysis Report */}
          {atsReport && (
            <div className="w-full rounded-2xl border border-purple-200 bg-white p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📊 Your ATS Resume Report
              </h2>

              <button
                onClick={handleDownloadATSReport}
                className="mb-5 flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700"
              >
                <FileText size={18} />
                Download ATS Report PDF
              </button>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">ATS Score</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {atsReport.atsScore}/100
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full"
                    style={{ width: `${atsReport.atsScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <h3 className="font-bold text-green-700 mb-2">
                    ✅ Strengths
                  </h3>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    {atsReport.strengths?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-red-600 mb-2">⚠️ Weaknesses</h3>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    {atsReport.weaknesses?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-blue-600 mb-2">
                    🔑 Missing Keywords
                  </h3>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    {atsReport.missingKeywords?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-purple-600 mb-2">
                    💡 Suggestions
                  </h3>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    {atsReport.suggestions?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-purple-50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-800 mb-2">
                  Overall Assessment
                </h3>
                <p className="text-gray-600">{atsReport.summary}</p>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                AI-generated estimate. This is not a guaranteed ATS score or
                hiring outcome.
              </p>
            </div>
          )}
        </section>

        {/* AI Job Recommendations */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h2 className="text-lg font-bold text-gray-900">
                  AI Job Recommendations
                </h2>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Discover jobs that match your skills and profile with HireNova
                AI.
              </p>
            </div>

            <button
              onClick={handleGetRecommendations}
              disabled={recommendationLoading}
              className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:opacity-50"
            >
              {recommendationLoading
                ? "Finding Jobs..."
                : "Find My Best Jobs →"}
            </button>
          </div>
        </section>

        {/* AI Mock Interview */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎤</span>
                <h2 className="text-lg font-bold text-gray-900">
                  AI Mock Interview
                </h2>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Practice real interview questions with HireNova AI.
              </p>
            </div>

            <button
              onClick={() => setShowMockInterview(true)}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Start Mock Interview →
            </button>
          </div>
        </section>

        {/* Mock Interview Setup */}
        {showMockInterview && (
          <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                🎯 Interview Setup
              </h2>

              <button
                onClick={() => setShowMockInterview(false)}
                className="text-sm font-semibold text-gray-500 hover:text-red-600"
              >
                Close ✕
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Select Job Role
                </label>

                <select
                  value={interviewRole}
                  onChange={(e) => setInterviewRole(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500"
                >
                  <option value="MERN Stack Developer">
                    MERN Stack Developer
                  </option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Java Developer">Java Developer</option>
                  <option value="Python Developer">Python Developer</option>
                  <option value="Full Stack Developer">
                    Full Stack Developer
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Experience Level
                </label>

                <select
                  value={interviewLevel}
                  onChange={(e) => setInterviewLevel(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500"
                >
                  <option value="Fresher">Fresher</option>
                  <option value="1 Year">1 Year</option>
                  <option value="2 Years">2 Years</option>
                  <option value="Experienced">Experienced</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartMockInterview}
              disabled={interviewLoading}
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {interviewLoading
                ? "Generating Questions..."
                : "Generate Interview Questions →"}
            </button>

            {interviewError && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {interviewError}
              </p>
            )}
          </section>
        )}

        {/* Mock Interview Questions */}
        {showMockInterview && interviewQuestions.length > 0 && (
          <section className="mb-8 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                🤖 HireNova AI Interview
              </h2>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                Question {currentQuestion + 1} / {interviewQuestions.length}
              </span>
            </div>

            <div className="mb-5 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${((currentQuestion + 1) / interviewQuestions.length) * 100}%`,
                }}
              />
            </div>

            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              {interviewQuestions[currentQuestion].type}
            </span>

            <div className="mt-4">
              <h3 className="text-lg font-bold leading-8 text-gray-900">
                {interviewQuestions[currentQuestion].question}
              </h3>

              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSpeakQuestion}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  🔊 Listen to Question
                </button>

                <button
                  type="button"
                  onClick={handleStopSpeaking}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  ⏹ Stop Voice
                </button>
              </div>
            </div>

            <div className="mt-5">
              <textarea
                value={interviewAnswers[currentQuestion] || ""}
                onChange={(e) => {
                  const updatedAnswers = [...interviewAnswers];
                  updatedAnswers[currentQuestion] = e.target.value;
                  setInterviewAnswers(updatedAnswers);
                }}
                rows={6}
                placeholder="Type your answer or use the microphone..."
                className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:border-blue-500"
              />

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={!voiceSupported}
                  className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
                    isListening
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } disabled:opacity-50`}
                >
                  🎤 {isListening ? "Stop Recording" : "Speak Your Answer"}
                </button>

                {isListening && (
                  <span className="text-sm font-medium text-red-600">
                    Listening... Speak now
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-between gap-3">
              <button
                onClick={() =>
                  setCurrentQuestion((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestion === 0}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 disabled:opacity-40"
              >
                ← Previous
              </button>

              {currentQuestion < interviewQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                  disabled={!interviewAnswers[currentQuestion]?.trim()}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={handleEvaluateMockInterview}
                  disabled={
                    interviewLoading ||
                    evaluationLoading ||
                    interviewAnswers.length !== interviewQuestions.length ||
                    interviewAnswers.some((answer) => !answer?.trim())
                  }
                  className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {evaluationLoading ? "Evaluating..." : "Finish Interview"}
                </button>
              )}
            </div>
          </section>
        )}

        {/* AI Mock Interview Evaluation Report */}
        {evaluation && (
          <section className="mb-8 rounded-2xl border border-green-100 bg-white p-5 shadow-sm md:p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              🏆 Your Interview Evaluation
            </h2>

            <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center">
              <p className="text-sm font-semibold text-gray-600">
                Overall Interview Score
              </p>

              <p className="mt-2 text-5xl font-extrabold text-blue-600">
                {evaluation.overallScore}/100
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {evaluation.overallScore >= 80
                  ? "Excellent Performance! 🌟"
                  : evaluation.overallScore >= 60
                    ? "Good Performance! 👍"
                    : "Keep Practicing! 💪"}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl bg-green-50 p-4">
                <h3 className="mb-3 font-bold text-green-800">
                  ✅ Your Strengths
                </h3>

                <ul className="space-y-2 text-sm text-gray-700">
                  {(evaluation.strengths || []).map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-orange-50 p-4">
                <h3 className="mb-3 font-bold text-orange-800">
                  💡 Areas to Improve
                </h3>

                <ul className="space-y-2 text-sm text-gray-700">
                  {(evaluation.improvements || []).map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <h3 className="mb-4 mt-6 font-bold text-gray-900">
              📝 Question-wise Feedback
            </h3>

            <div className="space-y-4">
              {(evaluation.feedback || []).map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-100 p-4"
                >
                  <p className="font-semibold text-gray-900">
                    Q{index + 1}. {item.question}
                  </p>

                  <p className="mt-2 text-sm font-bold text-blue-600">
                    Score: {item.score}/10
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {item.feedback}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-purple-50 p-4">
              <h3 className="font-bold text-purple-800">
                🤖 HireNova AI Final Feedback
              </h3>

              <p className="mt-2 text-sm leading-7 text-gray-700">
                {evaluation.finalFeedback}
              </p>
            </div>
          </section>
        )}

        {evaluationError && (
          <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {evaluationError}
          </p>
        )}

        {/* Recommended Jobs Results */}
        {showRecommendations && (
          <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              ✨ Jobs Recommended For You
            </h2>

            {recommendationLoading && (
              <p className="py-8 text-center text-gray-500">
                HireNova AI is analyzing your profile...
              </p>
            )}

            {recommendationError && (
              <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {recommendationError}
              </p>
            )}

            {!recommendationLoading &&
              !recommendationError &&
              recommendations.length === 0 && (
                <p className="py-8 text-center text-gray-500">
                  No recommendations available.
                </p>
              )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {recommendations.map((item) => {
                const recommendedJob = item.job;

                if (!recommendedJob) return null;

                return (
                  <div
                    key={item.jobId}
                    className="rounded-2xl border border-purple-100 p-5 transition hover:shadow-md"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                        ✨ AI Recommended
                      </span>

                      <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                        {item.matchPercentage}% Match
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">
                      {recommendedJob.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      {recommendedJob.company?.name || "Company"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>📍 {recommendedJob.location}</span>
                      <span>💰 {recommendedJob.salary}</span>
                      <span>💼 {recommendedJob.jobType}</span>
                    </div>

                    <div className="mt-4 rounded-xl bg-purple-50 p-3">
                      <p className="text-xs font-bold text-purple-800">
                        Why HireNova AI recommended this job
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {item.reason}
                      </p>
                    </div>

                    <button
                      onClick={() => handleApplyJob(recommendedJob._id)}
                      className="mt-5 w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
                    >
                      Apply Now →
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Dashboard Summary */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              Your Career Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your job search activities from one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Total Applications
                </p>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  📄
                </span>
              </div>
              <h3 className="mt-4 text-3xl font-bold text-gray-900">
                {appliedJobs.length}
              </h3>
              <p className="mt-2 text-xs text-gray-400">
                Jobs you have applied for
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
                  ⏳
                </span>
              </div>
              <h3 className="mt-4 text-3xl font-bold text-amber-600">
                {pendingCount}
              </h3>
              <p className="mt-2 text-xs text-gray-400">
                Waiting for recruiter response
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Accepted</p>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  ✓
                </span>
              </div>
              <h3 className="mt-4 text-3xl font-bold text-emerald-600">
                {acceptedCount}
              </h3>
              <p className="mt-2 text-xs text-gray-400">
                Applications accepted
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
                  ✕
                </span>
              </div>
              <h3 className="mt-4 text-3xl font-bold text-red-600">
                {rejectedCount}
              </h3>
              <p className="mt-2 text-xs text-gray-400">
                Applications rejected
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <p className="mt-1 text-sm text-gray-500">
              Access your most important student activities.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {/* Browse Jobs */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                💼
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                Browse Jobs
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Discover new opportunities that match your skills.
              </p>

              <button
                onClick={handleBrowseJobs}
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {showJobs ? "Hide Jobs" : "Explore Jobs →"}
              </button>
            </div>

            {/* Applied Jobs */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
                📋
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                Applied Jobs
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Check your applications and track their status.
              </p>

              <button
                onClick={handleAppliedJobs}
                className="mt-5 w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                {showAppliedJobs ? "Hide Applications" : "View Applications →"}
              </button>
            </div>

            {/* My Profile */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                👤
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                My Profile
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Update your personal details, skills and resume.
              </p>

              <button
                onClick={() => setShowProfileDialog(true)}
                className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Update Profile →
              </button>
            </div>
          </div>
        </section>

        {/* Track Applications */}
        <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl">
            📊
          </div>

          <h3 className="mt-5 text-lg font-bold text-gray-900">
            Track Applications
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Monitor your application status and check recruiter decisions.
          </p>

          <Link
            to="/student/track-applications"
            className="mt-5 block w-full rounded-xl bg-amber-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Track Now →
          </Link>
        </div>

        {/* Available Jobs */}
        {showJobs && (
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5 md:p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Available Jobs
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Find your next career opportunity.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {jobs.length} Jobs
              </span>
            </div>

            <div className="p-5 md:p-6">
              {loading && (
                <p className="py-8 text-center text-sm text-gray-500">
                  Loading jobs...
                </p>
              )}

              {message && (
                <p className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                  {message}
                </p>
              )}

              {!loading && !message && jobs.length === 0 && (
                <div className="py-10 text-center">
                  <div className="text-4xl">💼</div>
                  <p className="mt-3 font-semibold text-gray-700">
                    No jobs available right now.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="rounded-2xl border border-gray-200 p-5 transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                        💼
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {job.jobType || "Job"}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-gray-900">
                      {job.title}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-gray-600">
                      {job.company?.name || "Company information unavailable"}
                    </p>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
                      {job.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500">
                      <span>📍 {job.location || "Not specified"}</span>
                      <span>💰 {job.salary || "Not specified"}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
                      <p>
                        Experience: {job.experience ?? "Not specified"} years
                      </p>
                      <p>Position: {job.position || "Not specified"}</p>
                    </div>

                    <button
                      onClick={() => handleApplyJob(job._id)}
                      className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Apply Now →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Applied Jobs */}
        {showAppliedJobs && (
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5 md:p-6">
              <h2 className="text-xl font-bold text-gray-900">
                My Applied Jobs
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Track your application progress.
              </p>
            </div>

            <div className="p-5 md:p-6">
              {appliedLoading && (
                <p className="py-8 text-center text-sm text-gray-500">
                  Loading applied jobs...
                </p>
              )}

              {appliedMessage && (
                <p className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                  {appliedMessage}
                </p>
              )}

              {!appliedLoading &&
                !appliedMessage &&
                appliedJobs.length === 0 && (
                  <div className="py-10 text-center">
                    <div className="text-4xl">📋</div>
                    <p className="mt-3 font-semibold text-gray-700">
                      You have not applied for any jobs yet.
                    </p>
                    <button
                      onClick={handleBrowseJobs}
                      className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Browse Jobs
                    </button>
                  </div>
                )}

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {appliedJobs.map((application) => {
                  const job = application.job;

                  if (!job) return null;

                  const status = application.status?.toLowerCase() || "pending";

                  return (
                    <div
                      key={application._id}
                      className="rounded-2xl border border-gray-200 p-5 transition hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl">
                            💼
                          </div>

                          <div>
                            <h3 className="font-bold text-gray-900">
                              {job.title}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                              {job.company?.name || "Company not available"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(status)}`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-500">
                        {job.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500">
                        <span>📍 {job.location || "Not specified"}</span>
                        <span>◷ {job.jobType || "Not specified"}</span>
                      </div>

                      <div className="mt-3 text-xs text-gray-400">
                        Applied on: {formatDate(application.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* HireNova AI Chat Window */}
        {showAIChat && (
          <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 p-3 sm:items-center sm:p-6">
            <div className="flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                    <Bot size={25} />
                  </div>
                  <div>
                    <h2 className="font-bold">HireNova AI</h2>
                    <p className="text-xs text-purple-100">
                      Your Career Assistant
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAIChat(false)}
                  className="rounded-lg p-2 transition hover:bg-white/20"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Messages */}
              <div className="min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto bg-slate-50 p-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex min-w-0 w-full ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="min-w-0 max-w-[95%] overflow-hidden rounded-2xl bg-white p-3 text-sm leading-6 shadow-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="mb-3 mt-3 text-xl font-bold text-gray-900">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="mb-2 mt-4 text-lg font-bold text-gray-900">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="mb-2 mt-3 font-bold text-gray-900">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-3 break-words leading-7">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-gray-900">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-3 list-disc space-y-1 pl-6">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-3 list-decimal space-y-1 pl-6">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="break-words">{children}</li>
                          ),
                          table: ({ children }) => (
                            <div className="my-4 block w-full max-w-full overflow-x-auto rounded-lg border border-gray-200">
                              <table className="w-max min-w-[600px] border-collapse text-left text-sm">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-purple-100">{children}</thead>
                          ),
                          th: ({ children }) => (
                            <th className="whitespace-nowrap border border-gray-300 px-4 py-3 font-bold text-gray-900">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="max-w-[250px] border border-gray-300 px-4 py-3 align-top break-words">
                              {children}
                            </td>
                          ),
                          code: ({ children }) => (
                            <code className="rounded bg-gray-100 px-1 py-0.5 text-purple-700">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                      HireNova AI is thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendAIMessage}
                className="flex gap-2 border-t border-gray-100 bg-white p-3"
              >
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask HireNova AI anything..."
                  disabled={chatLoading}
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-500"
                />

                <button
                  type="submit"
                  disabled={chatLoading || !chatMessage.trim()}
                  className="flex items-center justify-center rounded-xl bg-purple-600 px-4 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={19} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Profile Dialog */}
        <UpdateProfileDialog
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
        />

        {/* Footer */}
        <div className="pb-3 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Job Portal. All rights reserved.
        </div>
      </div>
      {/* Floating HireNova AI Button */}
      <button
        onClick={() => setShowAIChat(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-xl transition hover:scale-110 hover:bg-purple-700"
        title="Chat with HireNova AI"
      >
        <MessageCircle size={26} />
      </button>
    </div>
  );
}

export default StudentDashboard;
