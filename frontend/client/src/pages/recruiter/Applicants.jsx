import { useEffect, useState } from "react";
import API from "../../api.js";
import { FileSearch, X } from "lucide-react";

const Applicants = () => {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // HireNova AI states
  const [evaluatingId, setEvaluatingId] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);

  // Filters
  const [filter, setFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState("all");
  const [search, setSearch] = useState("");

  // Load applicants
  const loadApplicants = async () => {
    try {
      setLoading(true);
      setMessage("");

      const jobResponse = await API.get("/job/getadminjobs");
      const jobList = jobResponse.data.jobs || [];

      setJobs(jobList);

      const results = await Promise.all(
        jobList.map(async (job) => {
          try {
            const response = await API.get(
              `/application/${job._id}/applicants`,
            );

            const data =
              response.data.applications ||
              response.data.applicants ||
              response.data.data ||
              [];

            return data.map((application) => ({
              ...application,
              jobTitle: job.title,
              jobId: job._id,
            }));
          } catch (error) {
            console.error(`Failed to load applicants for ${job.title}`, error);
            return [];
          }
        }),
      );

      const allApplicants = results.flat();

      allApplicants.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );

      setApplicants(allApplicants);

      if (allApplicants.length === 0) {
        setMessage("No applicants have applied to your jobs yet.");
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, []);

  // Update application status
  const handleStatusUpdate = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      setMessage("");

      const response = await API.put(
        `/application/status/${applicationId}/update`,
        { status },
      );

      if (response.data.success) {
        setMessage(`Application ${status} successfully.`);
        await loadApplicants();
      } else {
        setMessage(response.data.message || "Status update failed.");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to update application status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // HireNova AI Candidate Evaluation
  const handleEvaluateCandidate = async (applicationId) => {
    if (!applicationId) {
      setMessage("Application ID is missing.");
      return;
    }

    try {
      setEvaluatingId(applicationId);
      setEvaluation(null);
      setResumeAnalysis(null);
      setMessage("");

      const response = await API.post("/ai/evaluate-candidate", {
        applicationId,
      });

      if (response.data.success) {
        setEvaluation(response.data);
      } else {
        setMessage(response.data.message || "Candidate evaluation failed.");
      }
    } catch (error) {
      console.error("Candidate Evaluation Error:", error);

      setMessage(
        error.response?.data?.message || "Unable to evaluate candidate.",
      );
    } finally {
      setEvaluatingId(null);
    }
  };

  // HireNova AI Resume Analyzer
  const handleAnalyzeResume = async (applicationId) => {
    if (!applicationId) {
      setMessage("Application ID is missing.");
      return;
    }

    try {
      setAnalyzingId(applicationId);
      setResumeAnalysis(null);
      setEvaluation(null);
      setMessage("");

      const response = await API.post("/ai/analyze-resume", { applicationId });

      if (response.data.success) {
        setResumeAnalysis(response.data);
      } else {
        setMessage(response.data.message || "Resume analysis failed.");
      }
    } catch (error) {
      console.error("Resume Analysis Error:", error);

      setMessage(error.response?.data?.message || "Unable to analyze resume.");
    } finally {
      setAnalyzingId(null);
    }
  };

  // Get student information
  const getStudent = (application) => {
    const student =
      application.applicant ||
      application.student ||
      application.user ||
      application.userId ||
      {};

    return typeof student === "object" && student !== null ? student : {};
  };

  // Status style
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "rejected":
        return "bg-red-50 text-red-600 border-red-100";

      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  // Statistics
  const pendingCount = applicants.filter(
    (a) => (a.status || "pending").toLowerCase() === "pending",
  ).length;

  const acceptedCount = applicants.filter(
    (a) => a.status?.toLowerCase() === "accepted",
  ).length;

  const rejectedCount = applicants.filter(
    (a) => a.status?.toLowerCase() === "rejected",
  ).length;

  const statCards = [
    {
      title: "Total Applicants",
      value: applicants.length,
      icon: "👥",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: "⏳",
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Accepted",
      value: acceptedCount,
      icon: "✓",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Rejected",
      value: rejectedCount,
      icon: "✕",
      color: "bg-red-50 text-red-600",
    },
  ];

  // Filter applicants
  const filteredApplicants = applicants.filter((application) => {
    const status = (application.status || "pending").toLowerCase();

    const student = getStudent(application);

    const name =
      student.fullName ||
      student.fullname ||
      student.name ||
      student.username ||
      "";

    const email = student.email || "";
    const jobTitle = application.jobTitle || "";

    const searchText = search.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(searchText) ||
      email.toLowerCase().includes(searchText) ||
      jobTitle.toLowerCase().includes(searchText);

    const matchesStatus = filter === "all" || status === filter;

    const matchesJob =
      selectedJob === "all" || application.jobId === selectedJob;

    return matchesSearch && matchesStatus && matchesJob;
  });

  // Filter buttons
  const filterOptions = [
    { label: "All Applicants", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "Rejected", value: "rejected" },
  ];

  // Resume URL
  const getResumeUrl = (resume) => {
    if (!resume) return "";

    return resume.startsWith("http")
      ? resume
      : `http://localhost:5011/uploads/${resume}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
            <span>Recruiter</span>
            <span>/</span>
            <span className="font-medium text-blue-600">Applicants</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 md:text-3xl">
            Applicants
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review candidates and manage your recruitment process.
          </p>
        </div>

        <button
          onClick={loadApplicants}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          ↻ Refresh Applicants
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-3 text-3xl font-extrabold text-slate-800">
                  {loading ? "..." : card.value}
                </h2>
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${card.color}`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Applicants Management */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Section Header */}
        <div className="border-b border-slate-100 p-5 md:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                All Applicants
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review and manage candidates who applied for your jobs.
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600">
              {filteredApplicants.length} Results
            </span>
          </div>

          {/* Search and Job Filter */}
          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate, email or job..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none focus:border-blue-500"
            >
              <option value="all">All Jobs</option>

              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearch("");
                setSelectedJob("all");
                setFilter("all");
              }}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>

          {/* Status Filters */}
          <div className="mt-5 flex flex-wrap gap-2">
            {filterOptions.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  filter === item.value
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mx-5 mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700 md:mx-6">
            {message}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="text-sm font-medium text-slate-500">
              Loading applicants...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && applicants.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
              👥
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              No Applicants Yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Candidates will appear here when they apply for your jobs.
            </p>
          </div>
        )}

        {/* No Search Results */}
        {!loading &&
          applicants.length > 0 &&
          filteredApplicants.length === 0 && (
            <div className="p-12 text-center">
              <div className="mb-3 text-4xl">🔍</div>

              <h2 className="text-lg font-bold text-slate-800">
                No Matching Applicants
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          )}

        {/* Applicant Cards */}
        {!loading && filteredApplicants.length > 0 && (
          <div className="divide-y divide-slate-100">
            {filteredApplicants.map((application) => {
              const student = getStudent(application);

              const name =
                student.fullName ||
                student.fullname ||
                student.name ||
                student.username ||
                "Student";

              const status = application.status || "pending";

              const phone =
                student.phoneNumber || student.phonenumber || "Not available";

              const resume = student.resume;

              return (
                <div
                  key={application._id}
                  className="p-5 transition hover:bg-slate-50/70 md:p-6"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    {/* Candidate Information */}
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-600">
                        {name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="break-words text-lg font-bold text-slate-800">
                            {name}
                          </h3>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(status)}`}
                          >
                            {status}
                          </span>
                        </div>

                        <p className="mt-2 break-all text-sm text-slate-500">
                          ✉ {student.email || "Email not available"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">☎ {phone}</p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                            💼 {application.jobTitle || "Job"}
                          </span>

                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                            Applied:{" "}
                            {application.createdAt
                              ? new Date(
                                  application.createdAt,
                                ).toLocaleDateString()
                              : "Date unavailable"}
                          </span>
                        </div>

                        {resume && (
                          <a
                            href={getResumeUrl(resume)}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
                          >
                            📄 View Resume ↗
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Candidate Actions */}
                    <div className="flex flex-wrap gap-2 lg:min-w-[230px] lg:justify-end">
                      <button
                        onClick={() =>
                          handleStatusUpdate(application._id, "accepted")
                        }
                        disabled={
                          updatingId === application._id ||
                          status.toLowerCase() === "accepted"
                        }
                        className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none"
                      >
                        {updatingId === application._id
                          ? "Updating..."
                          : "✓ Accept"}
                      </button>

                      <button
                        onClick={() =>
                          handleStatusUpdate(application._id, "rejected")
                        }
                        disabled={
                          updatingId === application._id ||
                          status.toLowerCase() === "rejected"
                        }
                        className="flex-1 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none"
                      >
                        ✕ Reject
                      </button>

                      {/* Candidate Evaluation */}
                      <button
                        onClick={() => handleEvaluateCandidate(application._id)}
                        disabled={
                          evaluatingId === application._id ||
                          analyzingId === application._id
                        }
                        className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {evaluatingId === application._id
                          ? "Analyzing..."
                          : "✨ Evaluate with HireNova AI"}
                      </button>

                      {/* Resume Analyzer */}
                      <button
                        onClick={() => handleAnalyzeResume(application._id)}
                        disabled={
                          analyzingId === application._id ||
                          evaluatingId === application._id ||
                          !resume
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FileSearch size={17} />

                        {analyzingId === application._id
                          ? "Analyzing Resume..."
                          : "Analyze Resume with AI"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Candidate Evaluation Modal */}
      {evaluation && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  ✨ HireNova AI Evaluation
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {evaluation.candidateName} · {evaluation.jobTitle}
                </p>
              </div>

              <button
                onClick={() => setEvaluation(null)}
                className="rounded-lg px-3 py-2 text-xl text-gray-500 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="rounded-xl bg-purple-50 p-5">
              <h3 className="mb-3 font-semibold text-purple-800">
                Candidate Evaluation Report
              </h3>

              <div className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                {evaluation.evaluation}
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              AI-generated suggestions are decision-support information. The
              recruiter must independently review the candidate.
            </p>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setEvaluation(null)}
                className="rounded-lg bg-gray-800 px-6 py-2.5 font-semibold text-white hover:bg-gray-900"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Analysis Modal */}
      {resumeAnalysis && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-indigo-600">
                  <FileSearch size={22} />
                  <span className="text-sm font-bold">
                    HireNova AI Resume Analyzer
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-800">
                  Resume Analysis Report
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {resumeAnalysis.candidateName} · {resumeAnalysis.jobTitle}
                </p>
              </div>

              <button
                onClick={() => setResumeAnalysis(null)}
                className="rounded-lg px-3 py-2 text-xl text-gray-500 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
              <h3 className="mb-3 font-semibold text-indigo-800">
                AI Resume Analysis
              </h3>

              <div className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                {resumeAnalysis.analysis}
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              AI-generated analysis is decision-support information, not a final
              hiring decision. Please review the original resume and verify the
              candidate's qualifications.
            </p>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setResumeAnalysis(null)}
                className="rounded-lg bg-gray-800 px-6 py-2.5 font-semibold text-white hover:bg-gray-900"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applicants;
