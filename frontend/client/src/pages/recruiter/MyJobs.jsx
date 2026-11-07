import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api.js";

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [editingJob, setEditingJob] = useState(null);
  const [updatingJob, setUpdatingJob] = useState(false);
  const [deletingJob, setDeletingJob] = useState(null);

  const navigate = useNavigate();

  // Load recruiter's jobs
  const loadMyJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/job/getadminjobs");

      if (response.data.success) {
        setJobs(response.data.jobs || []);
      } else {
        setJobs([]);
        setError(response.data.message || "No jobs found.");
      }
    } catch (err) {
      setJobs([]);
      setError(err.response?.data?.message || "Failed to load your jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyJobs();
  }, []);

  // Job type options
  const jobTypes = [...new Set(jobs.map((job) => job.jobType).filter(Boolean))];

  // Search and filter jobs
  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (job.title || "").toLowerCase().includes(searchText) ||
      (job.location || "").toLowerCase().includes(searchText) ||
      (job.company?.name || "").toLowerCase().includes(searchText);

    const matchesType = selectedType === "All" || job.jobType === selectedType;

    return matchesSearch && matchesType;
  });

  // Open edit form
  const handleEditJob = (job) => {
    setEditingJob({
      ...job,
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join(", ")
        : job.requirements || "",
    });
  };

  // Handle input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditingJob((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update job
  const handleUpdateJob = async (e) => {
    e.preventDefault();

    if (!editingJob?._id) {
      alert("Job ID not found!");
      return;
    }

    setUpdatingJob(true);

    try {
      const updatedData = {
        ...editingJob,
        experience: Number(editingJob.experience),
        requirements:
          typeof editingJob.requirements === "string"
            ? editingJob.requirements
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : editingJob.requirements,
      };

      const response = await API.put(
        `/job/update/${editingJob._id}`,
        updatedData,
      );

      if (response.data.success) {
        alert("Job updated successfully!");
        setEditingJob(null);
        await loadMyJobs();
      } else {
        alert(response.data.message || "Failed to update job.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update job.");
    } finally {
      setUpdatingJob(false);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?",
    );

    if (!confirmed) return;

    setDeletingJob(jobId);

    try {
      const response = await API.delete(`/job/delete/${jobId}`);

      if (response.data.success) {
        alert("Job deleted successfully!");
        await loadMyJobs();
      } else {
        alert(response.data.message || "Failed to delete job.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete job.");
    } finally {
      setDeletingJob(null);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
            <span>Recruiter</span>
            <span>/</span>
            <span className="font-medium text-blue-600">My Jobs</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 md:text-3xl">
            My Jobs
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage, update and track all your job opportunities.
          </p>
        </div>

        <button
          onClick={() => navigate("/recruiter/post-job")}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <span className="text-lg">+</span>
          Post New Job
        </button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Jobs Posted
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-slate-800">
              {loading ? "..." : jobs.length}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Your job opportunities
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            💼
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">Matching Jobs</p>

            <h2 className="mt-2 text-3xl font-extrabold text-slate-800">
              {loading ? "..." : filteredJobs.length}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Based on your current filters
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
            📋
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800">Job Listings</h2>

          <p className="mt-1 text-sm text-slate-500">
            Search and manage your posted jobs.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, location or company..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none focus:border-blue-500"
          >
            <option value="All">All Job Types</option>

            {jobTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearch("");
              setSelectedType("All");
            }}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            Loading your jobs...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
          {error}
          <button onClick={loadMyJobs} className="ml-3 font-semibold underline">
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && jobs.length === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
            💼
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            No Jobs Posted Yet
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            Start building your team by posting your first job opportunity.
          </p>

          <button
            onClick={() => navigate("/recruiter/post-job")}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Post Your First Job
          </button>
        </div>
      )}

      {/* No Search Results */}
      {!loading && !error && jobs.length > 0 && filteredJobs.length === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <div className="mb-3 text-4xl">🔍</div>

          <h2 className="text-lg font-bold text-slate-800">
            No Matching Jobs Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or filter.
          </p>
        </div>
      )}

      {/* Jobs List */}
      {!loading && !error && filteredJobs.length > 0 && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl md:p-6"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                    💼
                  </div>

                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-bold text-slate-800 transition group-hover:text-blue-600">
                      {job.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {job.company?.name || "Company"}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Posted
                </span>
              </div>

              {/* Job Details */}
              <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>📍</span>
                  <span>{job.location || "Location not specified"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>💰</span>
                  <span>{job.salary || "Salary not specified"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>💼</span>
                  <span>{job.jobType || "Job type not specified"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>⭐</span>
                  <span>
                    {job.experience ?? "Not specified"} years experience
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-5">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Job Description
                </h3>

                <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                  {job.description || "No description available."}
                </p>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="mt-4">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Requirements
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(job.requirements)
                      ? job.requirements
                      : [job.requirements]
                    )
                      .slice(0, 5)
                      .map((requirement, index) => (
                        <span
                          key={index}
                          className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                        >
                          {requirement}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Posted Date */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400">
                  Posted on{" "}
                  <span className="font-semibold text-slate-600">
                    {job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString()
                      : "Recently"}
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleEditJob(job)}
                  className="flex-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => handleDeleteJob(job._id)}
                  disabled={deletingJob === job._id}
                  className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingJob === job._id ? "Deleting..." : "🗑 Delete"}
                </button>

                <button
                  onClick={() =>
                    navigate("/recruiter/applicants", {
                      state: { job },
                    })
                  }
                  className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                >
                  👥 Applicants
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Edit Job</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update your job information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateJob} className="space-y-5 p-6">
              {[
                ["title", "Job Title"],
                ["description", "Description"],
                ["requirements", "Requirements (comma separated)"],
                ["location", "Location"],
                ["salary", "Salary"],
                ["jobType", "Job Type"],
                ["position", "Position"],
                ["experience", "Experience (years)"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {label}
                  </label>

                  {name === "description" || name === "requirements" ? (
                    <textarea
                      name={name}
                      rows={name === "description" ? 4 : 3}
                      value={editingJob[name] ?? ""}
                      onChange={handleEditChange}
                      required
                      className={inputClass}
                    />
                  ) : (
                    <input
                      type={name === "experience" ? "number" : "text"}
                      name={name}
                      value={editingJob[name] ?? ""}
                      onChange={handleEditChange}
                      min={name === "experience" ? "0" : undefined}
                      required
                      className={inputClass}
                    />
                  )}
                </div>
              ))}

              {/* Modal Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingJob}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingJob ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
