import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api.js";
import Navbar from "../components/Navbar.jsx";

const getStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case "accepted":
      return {
        label: "Accepted",
        color: "bg-green-100 text-green-700",
        icon: "✓",
        description: "Congratulations! Your application has been accepted.",
      };

    case "rejected":
      return {
        label: "Rejected",
        color: "bg-red-100 text-red-700",
        icon: "×",
        description: "Unfortunately, your application was not selected.",
      };

    default:
      return {
        label: "Pending",
        color: "bg-amber-100 text-amber-700",
        icon: "◷",
        description: "Your application is waiting for a decision.",
      };
  }
};

function TrackApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/application/applied-jobs");

        setApplications(response.data.data || []);
      } catch (err) {
        console.error("Application tracking error:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load your applications. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApplications = applications.filter((application) => {
    if (filter === "all") return true;

    return application.status?.toLowerCase() === filter;
  });

  const pendingCount = applications.filter(
    (app) => app.status?.toLowerCase() === "pending",
  ).length;

  const acceptedCount = applications.filter(
    (app) => app.status?.toLowerCase() === "accepted",
  ).length;

  const rejectedCount = applications.filter(
    (app) => app.status?.toLowerCase() === "rejected",
  ).length;

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            Student Portal
          </p>

          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Track Applications
          </h1>

          <p className="mt-2 text-slate-500">
            Monitor your job applications and check their latest status.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Applications
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {applications.length}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Applications submitted
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pending</p>
            <h2 className="mt-2 text-3xl font-bold text-amber-600">
              {pendingCount}
            </h2>
            <p className="mt-1 text-xs text-slate-400">Awaiting decision</p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Accepted</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {acceptedCount}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Successful applications
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Rejected</p>
            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {rejectedCount}
            </h2>
            <p className="mt-1 text-xs text-slate-400">Not selected</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">
            Your Applications
          </h2>

          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "accepted", label: "Accepted" },
              { value: "rejected", label: "Rejected" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filter === item.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-4 text-slate-500">Loading your applications...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && applications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              📋
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No applications yet
            </h3>

            <p className="mt-2 text-slate-500">
              Start applying for jobs to track your application progress.
            </p>

            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Browse Jobs
            </Link>
          </div>
        )}

        {/* Application Cards */}
        {!loading &&
          !error &&
          applications.length > 0 &&
          filteredApplications.length === 0 && (
            <div className="rounded-xl bg-white p-10 text-center text-slate-500">
              No applications found for this status.
            </div>
          )}

        {!loading && !error && (
          <div className="space-y-5">
            {filteredApplications.map((application) => {
              const job = application.job;
              const company = job?.company;
              const status = getStatusConfig(application.status);

              return (
                <div
                  key={application._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {job?.title || "Job details unavailable"}
                        </h3>

                        <p className="mt-1 font-medium text-slate-600">
                          {company?.name || "Company not available"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                          {job?.location && <span>📍 {job.location}</span>}

                          {job?.jobType && <span>💼 {job.jobType}</span>}

                          {job?.salary && <span>💰 {job.salary}</span>}
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${status.color}`}
                      >
                        <span>{status.icon}</span>
                        {status.label}
                      </span>
                    </div>

                    {/* Application Timeline */}
                    <div className="mt-7 rounded-xl bg-slate-50 p-5">
                      <h4 className="mb-5 text-sm font-bold text-slate-800">
                        Application Progress
                      </h4>

                      <div className="flex items-start">
                        <div className="flex flex-1 flex-col items-center text-center">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                            ✓
                          </div>
                          <p className="mt-2 text-xs font-semibold text-slate-800 sm:text-sm">
                            Submitted
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(application.createdAt)}
                          </p>
                        </div>

                        <div className="mt-4 h-1 flex-1 rounded-full bg-slate-200">
                          <div
                            className={`h-1 rounded-full ${
                              application.status === "pending"
                                ? "w-0"
                                : "w-full bg-green-500"
                            }`}
                          />
                        </div>

                        <div className="flex flex-1 flex-col items-center text-center">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${
                              application.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {application.status === "pending" ? "◷" : "✓"}
                          </div>
                          <p className="mt-2 text-xs font-semibold text-slate-800 sm:text-sm">
                            {application.status === "pending"
                              ? "Pending Review"
                              : "Decision Made"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {application.status === "pending"
                              ? "Awaiting response"
                              : formatDate(application.updatedAt)}
                          </p>
                        </div>
                      </div>

                      <p className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
                        {status.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default TrackApplications;
