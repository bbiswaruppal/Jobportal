import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button.jsx";
import API from "../api.js";

function JobCard({ _id, title, company, location, salary }) {
  const navigate = useNavigate();

  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");

  const loggedIn = localStorage.getItem("isLoggedIn") === "true";

  const userRole = localStorage.getItem("userRole");

  const companyName =
    typeof company === "object"
      ? company?.name || "Company name unavailable"
      : company || "Company name unavailable";

  const companyLogo =
    typeof company === "object" && company?.logo
      ? `http://localhost:5011/uploads/${company.logo}`
      : null;

  // Direct Apply
  const handleApply = async () => {
    try {
      setApplying(true);
      setMessage("");

      const response = await API.post(`/application/apply/${_id}`);

      if (response.data.success) {
        setMessage("Application submitted successfully!");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to apply for this job.",
      );
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-lg">
      {/* Company Logo and Name */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={`${companyName} logo`}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-xl font-bold text-blue-600">
              {companyName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div>
          <p className="font-semibold text-gray-900">{companyName}</p>
          <p className="text-xs text-gray-500">Hiring Company</p>
        </div>
      </div>

      {/* Job Title */}
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>

      {/* Location */}
      <p className="mt-3 text-sm text-gray-500">📍 {location}</p>

      {/* Salary */}
      <p className="mt-4 font-semibold text-blue-600">{salary}</p>

      {/* Buttons */}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => navigate(`/jobs/${_id}`)}>View Job</Button>

        {loggedIn && userRole === "Student" && (
          <Button onClick={handleApply} disabled={applying}>
            {applying ? "Applying..." : "Apply Now"}
          </Button>
        )}
      </div>

      {/* Application Message */}
      {message && (
        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-700">
          {message}
        </p>
      )}
    </div>
  );
}

export default JobCard;
