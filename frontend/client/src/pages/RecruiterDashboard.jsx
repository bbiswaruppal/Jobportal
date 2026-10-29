
import { useState } from "react";
import API from "../api.js";

function RecruiterDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  const [companyData, setCompanyData] = useState({
    companyName: "",
    description: "",
    website: "",
    location: "",
    address: "",
  });

  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
    jobType: "",
    position: "",
    companyId: "",
    experience: "",
  });

  const [jobs, setJobs] = useState([]);
  const [showJobs, setShowJobs] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [showApplicants, setShowApplicants] = useState(false);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantMessage, setApplicantMessage] = useState("");

  // Company form input
  function handleCompanyChange(e) {
    setCompanyData({
      ...companyData,
      [e.target.name]: e.target.value,
    });
  }

  // Register company
  async function handleCompanySubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await API.post(
        "/company/register",
        companyData
      );

      if (response.data.success) {
        const companyId = response.data.company._id;

        localStorage.setItem("companyId", companyId);

        setMessage(
          `Company registered successfully! Company ID: ${companyId}`
        );

        setCompanyData({
          companyName: "",
          description: "",
          website: "",
          location: "",
          address: "",
        });

        setShowCompanyForm(false);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Company registration failed."
      );
    }
  }

  // Job form input
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // Post a job
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await API.post("/job/post", {
        ...formData,
        experience: Number(formData.experience),
      });

      if (response.data.success) {
        setMessage("Job posted successfully!");

        setFormData({
          title: "",
          description: "",
          requirements: "",
          location: "",
          salary: "",
          jobType: "",
          position: "",
          companyId: "",
          experience: "",
        });

        setShowForm(false);

        if (showJobs) {
          loadMyJobs();
        }
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to post job."
      );
    }
  }

  // Load recruiter's own jobs
  async function loadMyJobs() {
    setJobsLoading(true);
    setApplicantMessage("");

    try {
      const response = await API.get("/job/getadminjobs");

      if (response.data.success) {
        setJobs(response.data.jobs || []);
      } else {
        setJobs([]);
      }
    } catch (error) {
      setJobs([]);
      setApplicantMessage(
        error.response?.data?.message ||
          "Failed to load your jobs."
      );
    } finally {
      setJobsLoading(false);
    }
  }

  // Show/hide recruiter jobs
  async function handleManageJobs() {
    if (showJobs) {
      setShowJobs(false);
      setShowApplicants(false);
      return;
    }

    setShowJobs(true);
    setShowApplicants(false);
    await loadMyJobs();
  }

  // Load applicants for selected job
  async function handleViewApplicants(job) {
    setSelectedJob(job);
    setShowApplicants(true);
    setApplicantsLoading(true);
    setApplicantMessage("");
    setApplicants([]);

    try {
      const response = await API.get(
        `/application/${job._id}/applicants`
      );

      if (response.data.success) {
        const data =
          response.data.applications ||
          response.data.applicants ||
          response.data.data ||
          [];

        setApplicants(data);

        if (data.length === 0) {
          setApplicantMessage(
            "No applicants have applied for this job yet."
          );
        }
      } else {
        setApplicantMessage(
          response.data.message || "No applicants found."
        );
      }
    } catch (error) {
      setApplicantMessage(
        error.response?.data?.message ||
          "Failed to load applicants. Please check your backend."
      );
    } finally {
      setApplicantsLoading(false);
    }
  }

  // Update application status
  async function handleStatusUpdate(applicationId, status) {
    try {
      const response = await API.put(
        `/application/status/${applicationId}/update`,
        { status }
      );

      if (response.data.success) {
        setApplicantMessage(
          `Application status updated to ${status}.`
        );

        if (selectedJob) {
          await handleViewApplicants(selectedJob);
        }
      } else {
        setApplicantMessage(
          response.data.message || "Status update failed."
        );
      }
    } catch (error) {
      setApplicantMessage(
        error.response?.data?.message ||
          "Failed to update application status."
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-blue-600">
          Recruiter Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome to your Recruiter Dashboard!
        </p>

        {message && (
          <p className="mt-4 break-words rounded bg-blue-100 p-3 text-blue-700">
            {message}
          </p>
        )}

        {/* Register Company */}
        <button
          onClick={() => setShowCompanyForm(!showCompanyForm)}
          className="mt-6 rounded bg-purple-600 px-4 py-2 text-white"
        >
          {showCompanyForm
            ? "Close Company Form"
            : "Register Company"}
        </button>

        {showCompanyForm && (
          <form
            onSubmit={handleCompanySubmit}
            className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow"
          >
            <h2 className="text-2xl font-bold">
              Register Your Company
            </h2>

            {[
              ["companyName", "Company Name"],
              ["description", "Company Description"],
              ["website", "Company Website"],
              ["location", "Company Location"],
              ["address", "Company Address"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="mb-1 block font-medium">
                  {label}
                </label>

                <input
                  name={name}
                  value={companyData[name]}
                  onChange={handleCompanyChange}
                  required
                  className="w-full rounded border border-gray-300 p-3"
                />
              </div>
            ))}

            <button
              type="submit"
              className="rounded bg-green-600 px-6 py-3 text-white"
            >
              Register Company
            </button>
          </form>
        )}

        {/* Dashboard Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">
              Post a Job
            </h2>

            <p className="mt-2 text-gray-600">
              Create and publish new job openings.
            </p>

            <button
              onClick={() => setShowForm(!showForm)}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
            >
              {showForm ? "Close Form" : "Post a Job"}
            </button>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">
              Manage Jobs
            </h2>

            <p className="mt-2 text-gray-600">
              View your posted jobs and manage applicants.
            </p>

            <button
              onClick={handleManageJobs}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
            >
              {showJobs ? "Hide My Jobs" : "View My Jobs"}
            </button>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">
              Applications
            </h2>

            <p className="mt-2 text-gray-600">
              Review applications from candidates.
            </p>

            <button
              onClick={handleManageJobs}
              className="mt-4 rounded bg-purple-600 px-4 py-2 text-white"
            >
              View Applications
            </button>
          </div>
        </div>

        {/* Post Job Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4 rounded-xl bg-white p-6 shadow"
          >
            <h2 className="text-2xl font-bold">
              Post a New Job
            </h2>

            {[
              ["title", "Job Title"],
              ["description", "Job Description"],
              ["requirements", "Requirements (comma separated)"],
              ["location", "Location"],
              ["salary", "Salary"],
              ["jobType", "Job Type (Full-time, Part-time, Internship)"],
              ["position", "Position"],
              ["companyId", "Company ID"],
              ["experience", "Experience (years)"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="mb-1 block font-medium">
                  {label}
                </label>

                <input
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  type={
                    name === "experience" ? "number" : "text"
                  }
                  min={name === "experience" ? "0" : undefined}
                  required
                  className="w-full rounded border border-gray-300 p-3"
                />
              </div>
            ))}

            <button
              type="submit"
              className="rounded bg-green-600 px-6 py-3 font-semibold text-white"
            >
              Submit Job
            </button>
          </form>
        )}

        {/* Recruiter's Jobs */}
        {showJobs && (
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">
              My Posted Jobs
            </h2>

            {jobsLoading && <p>Loading your jobs...</p>}

            {!jobsLoading && jobs.length === 0 && (
              <p className="rounded bg-yellow-100 p-3">
                No jobs found. Post a job first.
              </p>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="rounded-xl bg-white p-6 shadow"
                >
                  <h3 className="text-xl font-bold">
                    {job.title}
                  </h3>

                  <p className="mt-2 text-gray-600">
                    {job.description}
                  </p>

                  <p className="mt-2">
                    <strong>Location:</strong> {job.location}
                  </p>

                  <p className="mt-1">
                    <strong>Job Type:</strong> {job.jobType}
                  </p>

                  <p className="mt-1">
                    <strong>Salary:</strong> {job.salary}
                  </p>

                  <button
                    onClick={() => handleViewApplicants(job)}
                    className="mt-4 rounded bg-purple-600 px-4 py-2 text-white"
                  >
                    View Applicants
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applicants Section */}
        {showApplicants && selectedJob && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">
                Applicants for {selectedJob.title}
              </h2>

              <button
                onClick={() => setShowApplicants(false)}
                className="rounded bg-gray-600 px-4 py-2 text-white"
              >
                Close
              </button>
            </div>

            {applicantsLoading && <p className="mt-4">Loading applicants...</p>}

            {applicantMessage && (
              <p className="mt-4 rounded bg-yellow-100 p-3 text-gray-800">
                {applicantMessage}
              </p>
            )}

            {!applicantsLoading && applicants.length > 0 && (
              <div className="mt-4 grid gap-4">
                {applicants.map((application) => {
                  const student = application.applicant || {};

                  return (
                    <div
                      key={application._id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <h3 className="text-lg font-bold">
                        {student.fullname || "Student"}
                      </h3>

                      <p className="mt-1">
                        <strong>Email:</strong>{" "}
                        {student.email || "Not available"}
                      </p>

                      <p className="mt-1">
                        <strong>Phone:</strong>{" "}
                        {student.phoneNumber || "Not available"}
                      </p>

                      <p className="mt-2">
                        <strong>Status:</strong>{" "}
                        {application.status || "Pending"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              application._id,
                              "accepted"
                            )
                          }
                          className="rounded bg-green-600 px-4 py-2 text-white"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              application._id,
                              "rejected"
                            )
                          }
                          className="rounded bg-red-600 px-4 py-2 text-white"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboard;