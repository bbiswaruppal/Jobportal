import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import API from "./api.js";
import Navbar from "./components/Navbar.jsx";
import JobCard from "./components/JobCard.jsx";
import SearchBar from "./components/SearchBar.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import RecruiterDashboard from "./pages/RecruiterDashboard.jsx";
import TrackApplications from "./pages/TrackApplications.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCompanies from "./pages/admin/ManageCompanies";
import ManageApplications from "./pages/admin/ManageApplications";
import ManageJobs from "./pages/admin/ManageJobs";

import JobDetails from "./pages/JobDetails.jsx";
import CreateCompany from "./pages/CreateCompany.jsx";

import RecruiterLayout from "./layouts/RecruiterLayout.jsx";
import RecruiterHome from "./pages/recruiter/RecruiterHome.jsx";
import PostJob from "./pages/recruiter/PostJob.jsx";
import MyJobs from "./pages/recruiter/MyJobs.jsx";
import Applicants from "./pages/recruiter/Applicants.jsx";
import MyProfile from "./pages/recruiter/MyProfile.jsx";
import CompanySettings from "./pages/recruiter/CompanySettings.jsx";

function App() {
  const [search, setSearch] = useState({
    jobTitle: "",
    location: "",
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await API.get("/job/get");
        setJobs(response.data.jobs || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err.response?.data?.message || "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const title = String(job.title || "").toLowerCase();
    const location = String(job.location || "").toLowerCase();

    const titleMatch = title.includes(search.jobTitle.trim().toLowerCase());

    const locationMatch = location.includes(
      search.location.trim().toLowerCase(),
    );

    return titleMatch && locationMatch;
  });

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gray-50">
            <Navbar />

            <section className="px-6 py-20 text-center">
              <p className="mb-4 font-semibold text-blue-600">
                YOUR CAREER STARTS HERE
              </p>

              <h1 className="text-4xl font-bold text-gray-900 md:text-6xl">
                Find Your <span className="text-blue-600">Dream Job</span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-gray-600">
                Discover exciting job opportunities and take the next step
                towards your dream career.
              </p>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("featured-jobs")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Explore Jobs
              </button>

              <SearchBar onSearch={setSearch} />
            </section>

            <section id="featured-jobs" className="px-6 py-12 md:px-12">
              <h2 className="text-3xl font-bold">Featured Jobs</h2>

              {loading && <p className="mt-6 text-gray-600">Loading jobs...</p>}

              {!loading && error && (
                <p className="mt-6 text-red-600" role="alert">
                  {error}
                </p>
              )}

              {!loading && !error && (
                <>
                  <p className="mt-2 text-gray-600">
                    {filteredJobs.length} jobs found
                  </p>

                  <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredJobs.map((job) => (
                      <JobCard key={job._id} {...job} />
                    ))}
                  </div>

                  {filteredJobs.length === 0 && (
                    <p className="mt-6 text-gray-600">
                      No jobs found. Try another search.
                    </p>
                  )}
                </>
              )}
            </section>
          </div>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/student-dashboard" element={<StudentDashboard />} />

      {/* Student Application Tracking */}
      <Route
        path="/student/track-applications"
        element={<TrackApplications />}
      />

      {/* Recruiter Routes */}
      <Route path="/recruiter" element={<RecruiterLayout />}>
        <Route index element={<Navigate to="/recruiter-dashboard" replace />} />

        <Route path="dashboard" element={<RecruiterHome />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="my-jobs" element={<MyJobs />} />
        <Route path="applicants" element={<Applicants />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="company-settings" element={<CompanySettings />} />
      </Route>

      <Route
        path="/recruiter-dashboard"
        element={<Navigate to="/recruiter/dashboard" replace />}
      />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<ManageUsers />} />
      <Route path="/admin/companies" element={<ManageCompanies />} />
      <Route path="/admin/applications" element={<ManageApplications />} />
      <Route path="/admin/jobs" element={<ManageJobs />} />

      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/create-company" element={<CreateCompany />} />
    </Routes>
  );
}

export default App;
