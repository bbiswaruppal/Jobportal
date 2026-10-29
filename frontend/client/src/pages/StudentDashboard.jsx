import { useState } from "react";
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

  // Browse Jobs
  async function handleBrowseJobs() {
    if (showJobs) {
      setShowJobs(false);
      return;
    }

    setShowJobs(true);
    setLoading(true);
    setMessage("");

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
      setMessage(
        error.response?.data?.message || "Failed to load jobs."
      );
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

    try {
      const response = await API.get("/application/get");

      if (response.data.success) {
        setAppliedJobs(response.data.data || []);
      } else {
        setAppliedJobs([]);
        setAppliedMessage("No applied jobs found.");
      }
    } catch (error) {
      setAppliedJobs([]);
      setAppliedMessage(
        error.response?.data?.message ||
          "Failed to load applied jobs."
      );
    } finally {
      setAppliedLoading(false);
    }
  }

  // Apply for a Job
  async function handleApplyJob(jobId) {
    try {
      const response = await API.post(
        `/application/apply/${jobId}`
      );

      alert(
        response.data.message ||
          "Application submitted successfully!"
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to apply for this job."
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-blue-600">Student Dashboard</h1>

        <p className="mt-2 text-gray-600">Welcome to your Student Dashboard!</p>

        {/* Dashboard Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Browse Jobs */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Browse Jobs</h2>

            <p className="mt-2 text-gray-600">
              Explore available job opportunities.
            </p>

            <button
              onClick={handleBrowseJobs}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
            >
              {showJobs ? "Hide Jobs" : "Browse Jobs"}
            </button>
          </div>

          {/* Applied Jobs */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Applied Jobs</h2>

            <p className="mt-2 text-gray-600">
              View the jobs you have applied for.
            </p>

            <button
              onClick={handleAppliedJobs}
              className="mt-4 rounded bg-purple-600 px-4 py-2 text-white"
            >
              {showAppliedJobs ? "Hide Applied Jobs" : "View Applied Jobs"}
            </button>
          </div>

          {/* My Profile */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">My Profile</h2>
            <p className="mt-2 text-gray-600">
              Manage your profile and resume.
            </p>
            <button
              onClick={() => setShowProfileDialog(true)}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Update Profile
            </button>
          </div>
        </div>

        {/* Available Jobs Section */}
        {showJobs && (
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">Available Jobs</h2>

            {loading && <p>Loading jobs...</p>}

            {message && (
              <p className="rounded bg-yellow-100 p-3 text-gray-800">
                {message}
              </p>
            )}

            {!loading && !message && jobs.length === 0 && (
              <p>No jobs available right now.</p>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {jobs.map((job) => (
                <div key={job._id} className="rounded-xl bg-white p-6 shadow">
                  <h3 className="text-xl font-bold">{job.title}</h3>

                  <p className="mt-2 text-gray-600">{job.description}</p>

                  <p className="mt-2">
                    <strong>Location:</strong> {job.location}
                  </p>

                  <p className="mt-1">
                    <strong>Salary:</strong> {job.salary}
                  </p>

                  <p className="mt-1">
                    <strong>Job Type:</strong> {job.jobType}
                  </p>

                  <p className="mt-1">
                    <strong>Experience:</strong> {job.experience} years
                  </p>

                  <p className="mt-1">
                    <strong>Position:</strong> {job.position}
                  </p>

                  <p className="mt-1">
                    <strong>Company:</strong>{" "}
                    {job.company?.name || "Company information unavailable"}
                  </p>

                  <button
                    onClick={() => handleApplyJob(job._id)}
                    className="mt-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applied Jobs Section */}
        {showAppliedJobs && (
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">My Applied Jobs</h2>

            {appliedLoading && <p>Loading applied jobs...</p>}

            {appliedMessage && (
              <p className="rounded bg-yellow-100 p-3 text-gray-800">
                {appliedMessage}
              </p>
            )}

            {!appliedLoading && !appliedMessage && appliedJobs.length === 0 && (
              <p>You have not applied for any jobs yet.</p>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {appliedJobs.map((application) => {
                const job = application.job;

                if (!job) {
                  return null;
                }

                return (
                  <div
                    key={application._id}
                    className="rounded-xl bg-white p-6 shadow"
                  >
                    <h3 className="text-xl font-bold">{job.title}</h3>

                    <p className="mt-2 text-gray-600">{job.description}</p>

                    <p className="mt-2">
                      <strong>Company:</strong>{" "}
                      {job.company?.name || "Not available"}
                    </p>

                    <p className="mt-1">
                      <strong>Location:</strong> {job.location}
                    </p>

                    <p className="mt-1">
                      <strong>Job Type:</strong> {job.jobType}
                    </p>

                    <p className="mt-1">
                      <strong>Application Status:</strong>{" "}
                      {application.status || "Pending"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <UpdateProfileDialog
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
        />
      </div>
    </div>
  );
}

export default StudentDashboard;
