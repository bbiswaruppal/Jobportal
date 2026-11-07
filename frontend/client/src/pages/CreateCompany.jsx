import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api.js";

function CreateCompany() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    website: "",
    location: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await API.post("/company/register", formData);

      setMessage(response.data.message || "Company created successfully!");

      setTimeout(() => {
        navigate("/recruiter-dashboard");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create company."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow-sm md:p-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Create Company
        </h1>

        <p className="mb-6 text-gray-600">
          Enter your company details below.
        </p>

        {message && (
          <p className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-medium">Company Name *</label>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-4 py-3"
              placeholder="e.g. ABC Technologies"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
              placeholder="About your company"
              rows="3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Website</label>
            <input
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
              placeholder="e.g. Kolkata"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Address *</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-4 py-3"
              placeholder="Company address"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Company"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/recruiter-dashboard")}
            className="w-full rounded-lg border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateCompany;