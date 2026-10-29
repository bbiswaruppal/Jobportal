import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import JobCard from "./components/JobCard.jsx";
import SearchBar from "./components/SearchBar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import RecruiterDashboard from "./pages/RecruiterDashboard.jsx";

function App() {
  const [search, setSearch] = useState({
    jobTitle: "",
    location: "",
  });

  const jobs = [
    {
      title: "Frontend Developer",
      company: "Tech Solutions",
      location: "Kolkata · Full-time",
      salary: "₹3–6 LPA",
    },
    {
      title: "MERN Stack Developer",
      company: "Web Innovators",
      location: "Remote · Full-time",
      salary: "₹4–8 LPA",
    },
    {
      title: "React Developer Intern",
      company: "Startup Hub",
      location: "Kolkata · Internship",
      salary: "₹10k–15k/month",
    },
  ];

  const filteredJobs = jobs.filter((job) => {
    const titleMatch = job.title
      .toLowerCase()
      .includes(search.jobTitle.toLowerCase());

    const locationMatch = job.location
      .toLowerCase()
      .includes(search.location.toLowerCase());

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

              <button className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
                Explore Jobs
              </button>

              <SearchBar onSearch={setSearch} />
            </section>

            <section className="px-6 py-12 md:px-12">
              <h2 className="text-3xl font-bold">Featured Jobs</h2>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {filteredJobs.map((job) => (
                  <JobCard key={job.title} {...job} />
                ))}

                {filteredJobs.length === 0 && (
                  <p className="text-gray-600">
                    No jobs found. Try another search.
                  </p>
                )}
              </div>
            </section>
          </div>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />

      <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
    </Routes>
  );
}

export default App;
