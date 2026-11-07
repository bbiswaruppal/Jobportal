import { useState } from "react";
import API from "../../api.js";

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
    jobType: "",
    position: "",
    companyId: localStorage.getItem("companyId") || "",
    experience: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Generate Job Description using HireNova AI
  const handleGenerateDescription = async () => {
    setMessage("");

    if (!formData.title.trim()) {
      setMessage("Please enter Job Title first.");
      return;
    }

    setGenerating(true);

    try {
      const response = await API.post("/ai/generate-description", {
        jobTitle: formData.title,
        experience: formData.experience,
        location: formData.location,
        jobType: formData.jobType,
        skills: formData.requirements,
      });

      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          description: response.data.description,
        }));

        setMessage("Job description generated successfully!");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to generate job description.",
      );
    } finally {
      setGenerating(false);
    }
  };

  // Publish Job
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

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
          companyId: localStorage.getItem("companyId") || "",
          experience: "",
        });
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    ["title", "Job Title"],
    ["requirements", "Requirements (comma separated)"],
    ["location", "Location"],
    ["salary", "Salary"],
    ["jobType", "Job Type"],
    ["position", "Position"],
    ["companyId", "Company ID"],
    ["experience", "Experience (years)"],
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Post a New Job</h1>

        <p className="mt-2 text-gray-500">
          Create and publish a new job opportunity.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl bg-white p-6 shadow-sm md:p-8"
      >
        {message && (
          <p className="rounded-lg bg-blue-50 p-3 text-blue-700">{message}</p>
        )}

        {fields.map(([name, label]) => (
          <div key={name}>
            <label className="mb-2 block font-medium text-gray-700">
              {label}
            </label>

            <input
              type={name === "experience" ? "number" : "text"}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              min={name === "experience" ? "0" : undefined}
              required
              placeholder={`Enter ${label.toLowerCase()}`}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        ))}

        {/* Job Description + AI Generator */}
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <label className="font-medium text-gray-700">Job Description</label>

            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={generating || !formData.title.trim()}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? "Generating..." : "✨ Generate with HireNova AI"}
            </button>
          </div>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={10}
            placeholder="Write job description or generate it using HireNova AI..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-2 text-sm text-gray-500">
            Generate a professional job description using AI. You can edit it
            before publishing.
          </p>
        </div>

        {/* Publish Job */}
        <button
          type="submit"
          disabled={loading || generating}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Publishing..." : "Publish Job"}
        </button>
      </form>
    </div>
  );
};

export default PostJob;
