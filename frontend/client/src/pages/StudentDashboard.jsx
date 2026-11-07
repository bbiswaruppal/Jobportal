import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api.js";
import UpdateProfileDialog from "../components/UpdateProfileDialog.jsx";

function StudentDashboard() {
  const [showJobs, setShowJobs] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showAppliedJobs, setShowAppliedJobs] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [appliedLoading, setAppliedLoading] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState("");

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
    </div>
  );
}

export default StudentDashboard;
