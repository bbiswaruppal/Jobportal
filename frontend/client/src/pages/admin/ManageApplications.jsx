import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5011/api/admin/applications";

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        withCredentials: true,
      });

      setApplications(response.data.applications || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${API_URL}/${id}/status`,
        { status },
        { withCredentials: true }
      );

      alert("Application status updated successfully!");
      fetchApplications();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to update application status"
      );
    }
  };

  if (loading) {
    return <div className="p-6">Loading applications...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
        <button
          onClick={fetchApplications}
          className="ml-3 rounded bg-blue-600 px-3 py-1 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Manage Applications
        </h1>

        <p className="mt-2 text-gray-600">
          Total Applications: {applications.length}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4">Applicant</th>
              <th className="p-4">Email</th>
              <th className="p-4">Job Title</th>
              <th className="p-4">Location</th>
              <th className="p-4">Status</th>
              <th className="p-4">Update Status</th>
            </tr>
          </thead>

          <tbody>
            {applications.length > 0 ? (
              applications.map((application) => (
                <tr
                  key={application._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4">
                    {application.applicant?.fullname || "N/A"}
                  </td>

                  <td className="p-4">
                    {application.applicant?.email || "N/A"}
                  </td>

                  <td className="p-4">
                    {application.job?.title || "Job deleted"}
                  </td>

                  <td className="p-4">
                    {application.job?.location || "N/A"}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded px-3 py-1 text-sm ${
                        application.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : application.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {application.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <select
                      value={application.status}
                      onChange={(e) =>
                        updateStatus(application._id, e.target.value)
                      }
                      className="rounded border p-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-gray-500"
                >
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageApplications;