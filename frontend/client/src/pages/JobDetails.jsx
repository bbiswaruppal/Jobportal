import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api.js";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");

  // Company information
  const company = typeof job?.company === "object" ? job.company : null;

  const companyName = company?.name || "Company details unavailable";

  const companyLogo = company?.logo
    ? `http://localhost:5011/uploads/${company.logo}`
    : null;

  // Apply for Job
  const handleApply = async () => {
    try {
      setApplying(true);
      setApplyMessage("");

      const response = await API.post(`/application/apply/${id}`);

      if (response.data.success) {
        setApplyMessage("Application submitted successfully!");
      }
    } catch (error) {
      setApplyMessage(
        error.response?.data?.message || "Failed to apply for this job.",
      );
    } finally {
      setApplying(false);
    }
  };

  // Fetch Job Details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/job/get/${id}`);
        setJob(response.data.job);
      } catch (err) {
        console.error("Error fetching job:", err);

        setError(err.response?.data?.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Loading job details...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4 text-red-600">{error || "Job not found."}</p>

        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back
        </button>

        {/* Company Information */}
        <div className="rounded-xl border bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Company Logo */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-gray-50">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={`${companyName} logo`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-3xl font-bold text-blue-600">
                  {companyName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Company Details */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{companyName}</h2>

              {company?.location && (
                <p className="mt-1 text-gray-500">📍 {company.location}</p>
              )}

              {company?.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
                >
                  Visit Company Website ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Job Information */}
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-blue-50 px-4 py-2 text-blue-700">
              📍 {job.location}
            </span>

            <span className="rounded-full bg-green-50 px-4 py-2 text-green-700">
              {job.jobType}
            </span>

            <span className="rounded-full bg-purple-50 px-4 py-2 text-purple-700">
              {job.experience} Years Experience
            </span>
          </div>

          {/* Salary */}
          <div className="mt-6 border-b pb-6">
            <p className="text-sm text-gray-500">Salary</p>

            <p className="mt-1 text-2xl font-bold text-blue-600">
              {job.salary} LPA
            </p>
          </div>

          {/* Job Description */}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900">Job Description</h2>

            <p className="mt-3 whitespace-pre-line leading-7 text-gray-700">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">Requirements</h2>

            {Array.isArray(job.requirements) ? (
              <ul className="mt-3 list-inside list-disc space-y-2 text-gray-700">
                {job.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 whitespace-pre-line text-gray-700">
                {job.requirements}
              </p>
            )}
          </div>

          {/* Additional Details */}
          <div className="mt-8 grid gap-5 border-t pt-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Position</p>
              <p className="mt-1 font-semibold">{job.position}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Job Type</p>
              <p className="mt-1 font-semibold">{job.jobType}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Experience</p>
              <p className="mt-1 font-semibold">{job.experience} Years</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="mt-1 font-semibold">{companyName}</p>
            </div>
          </div>

          {/* Apply Section */}
          <div className="mt-8 border-t pt-6">
            {userRole === "Student" ? (
              <button
                onClick={handleApply}
                disabled={applying}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
              >
                {applying ? "Applying..." : "Apply Now"}
              </button>
            ) : !isLoggedIn ? (
              <button
                onClick={() => navigate("/login")}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Login to Apply
              </button>
            ) : (
              <p className="font-medium text-gray-600">
                You are not allowed to apply for this job.
              </p>
            )}

            {applyMessage && (
              <p className="mt-4 text-sm font-medium text-gray-700">
                {applyMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;
