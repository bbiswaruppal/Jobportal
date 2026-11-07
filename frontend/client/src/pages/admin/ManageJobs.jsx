import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";

const API_URL = "http://localhost:5011/api/admin/jobs";
const JOB_API_URL = "http://localhost:5011/api/job";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      setError("");

      const response = await axios.get(API_URL, {
        withCredentials: true,
      });

      if (response.data.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (err) {
      console.error("Fetch jobs error:", err);

      setError(err.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Search jobs
  const filteredJobs = jobs.filter((job) =>
    (job.title || "").toLowerCase().includes(search.toLowerCase()),
  );

  // Open edit form
  const handleEdit = (job) => {
    setEditingJob({
      ...job,
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      salary: job.salary ?? "",
      experience: job.experience ?? "",
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
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
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingJob?._id) {
      setError("Job ID is missing.");
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const updatedData = {
        title: editingJob.title.trim(),
        description: editingJob.description.trim(),
        location: editingJob.location.trim(),
        salary: Number(editingJob.salary),
        experience: Number(editingJob.experience),
        jobType: editingJob.jobType,
        position: editingJob.position,
        requirements: editingJob.requirements,
        companyId: editingJob.company?._id || editingJob.company,
      };

      const response = await axios.put(
        `${JOB_API_URL}/update/${editingJob._id}`,
        updatedData,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        alert(response.data.message || "Job updated successfully!");

        setEditingJob(null);
        await fetchJobs();
      } else {
        setError(response.data.message || "Failed to update job.");
      }
    } catch (err) {
      console.error("Update job error:", err.response?.data || err);

      setError(err.response?.data?.message || "Failed to update job.");
    } finally {
      setUpdating(false);
    }
  };

  // Delete job
  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await axios.delete(`${JOB_API_URL}/delete/${id}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setJobs((previousJobs) => previousJobs.filter((job) => job._id !== id));

        if (editingJob?._id === id) {
          setEditingJob(null);
        }

        alert(response.data.message || "Job deleted successfully!");
      } else {
        setError(response.data.message || "Failed to delete job.");
      }
    } catch (err) {
      console.error("Delete job error:", err.response?.data || err);

      setError(err.response?.data?.message || "Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Manage Jobs</h1>

          <p className="text-gray-600">Total registered jobs: {jobs.length}</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search job by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <p className="text-gray-600">Loading jobs...</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </p>

            {/* Edit Job Form */}
            {editingJob && (
              <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-5 text-2xl font-bold text-gray-800">
                  Edit Job
                </h2>

                <form
                  onSubmit={handleUpdate}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <input
                    type="text"
                    name="title"
                    placeholder="Job Title"
                    value={editingJob.title}
                    onChange={handleEditChange}
                    required
                    className="rounded-lg border p-3"
                  />

                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={editingJob.location}
                    onChange={handleEditChange}
                    required
                    className="rounded-lg border p-3"
                  />

                  <input
                    type="number"
                    name="salary"
                    placeholder="Salary"
                    value={editingJob.salary}
                    onChange={handleEditChange}
                    min="0"
                    required
                    className="rounded-lg border p-3"
                  />

                  <input
                    type="number"
                    name="experience"
                    placeholder="Experience (years)"
                    value={editingJob.experience}
                    onChange={handleEditChange}
                    min="0"
                    required
                    className="rounded-lg border p-3"
                  />

                  <textarea
                    name="description"
                    placeholder="Job Description"
                    value={editingJob.description}
                    onChange={handleEditChange}
                    required
                    rows="4"
                    className="rounded-lg border p-3 md:col-span-2"
                  />

                  <div className="flex gap-3 md:col-span-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingJob(null)}
                      disabled={updating}
                      className="rounded-lg bg-gray-500 px-5 py-3 font-semibold text-white hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Job Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="flex flex-col rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
                >
                  <h2 className="mb-3 text-xl font-bold text-gray-800">
                    {job.title || "Untitled Job"}
                  </h2>

                  <p className="mb-4 text-sm leading-6 text-gray-600">
                    {job.description || "No description available"}
                  </p>

                  <div className="flex-1 space-y-3 text-sm text-gray-700">
                    <p>
                      <strong>Company:</strong> {job.company?.name || "N/A"}
                    </p>

                    <p>
                      <strong>Location:</strong> {job.location || "N/A"}
                    </p>

                    <p>
                      <strong>Salary:</strong> {job.salary ?? "N/A"}
                    </p>

                    <p>
                      <strong>Job Type:</strong> {job.jobType || "N/A"}
                    </p>

                    <p>
                      <strong>Experience:</strong> {job.experience ?? "N/A"}
                    </p>
                  </div>

                  {/* Edit Job Button */}
                  <button
                    onClick={() => handleEdit(job)}
                    className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Edit Job
                  </button>

                  {/* Delete Job Button */}
                  <button
                    onClick={() =>
                      handleDelete(job._id, job.title || "this job")
                    }
                    disabled={deletingId === job._id}
                    className="mt-3 w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === job._id ? "Deleting..." : "Delete Job"}
                  </button>
                </div>
              ))}

              {/* Empty State */}
              {filteredJobs.length === 0 && (
                <div className="col-span-full rounded-xl bg-white p-10 text-center shadow">
                  <h2 className="mb-2 text-xl font-semibold text-gray-700">
                    No Jobs Found
                  </h2>

                  <p className="text-gray-500">
                    {search
                      ? "Try searching with a different job title."
                      : "There are currently no jobs registered."}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ManageJobs;
