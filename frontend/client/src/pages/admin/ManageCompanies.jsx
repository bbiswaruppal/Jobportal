import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";

const API_URL = "http://localhost:5011/api/admin/companies";

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all companies
  const fetchCompanies = async () => {
    try {
      setError("");

      const response = await axios.get(API_URL, {
        withCredentials: true,
      });

      if (response.data.success) {
        setCompanies(response.data.companies || []);
      }
    } catch (err) {
      console.error(
        "Fetch companies error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to fetch companies"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Search companies by name
  const filteredCompanies = companies.filter((company) =>
    (company.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Delete company
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await axios.delete(
        `${API_URL}/${id}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setCompanies((previousCompanies) =>
          previousCompanies.filter(
            (company) => company._id !== id
          )
        );

        alert(
          response.data.message ||
            "Company deleted successfully"
        );
      }
    } catch (err) {
      console.error(
        "Delete company error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete company"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Manage Companies
          </h1>

          <p className="text-gray-600">
            Total registered companies: {companies.length}
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search company by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <p className="text-gray-600">
            Loading companies...
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Showing {filteredCompanies.length} of{" "}
              {companies.length} companies
            </p>

            {/* Company Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCompanies.map((company) => (
                <div
                  key={company._id}
                  className="flex flex-col rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
                >
                  <h2 className="mb-3 text-xl font-bold text-gray-800">
                    {company.name || "Unnamed Company"}
                  </h2>

                  <p className="mb-4 min-h-12 text-sm leading-6 text-gray-600">
                    {company.description ||
                      "No description available"}
                  </p>

                  <div className="flex-1 space-y-3 text-sm text-gray-700">
                    <p>
                      <strong>Location:</strong>{" "}
                      {company.location || "N/A"}
                    </p>

                    <p>
                      <strong>Address:</strong>{" "}
                      {company.address || "N/A"}
                    </p>

                    <p>
                      <strong>Website:</strong>{" "}
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-blue-600 hover:underline"
                        >
                          Visit Website ↗
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() =>
                      handleDelete(
                        company._id,
                        company.name || "this company"
                      )
                    }
                    disabled={deletingId === company._id}
                    className="mt-6 w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === company._id
                      ? "Deleting..."
                      : "Delete Company"}
                  </button>
                </div>
              ))}

              {/* No Companies Found */}
              {filteredCompanies.length === 0 && (
                <div className="col-span-full rounded-xl bg-white p-10 text-center shadow">
                  <h2 className="mb-2 text-xl font-semibold text-gray-700">
                    No Companies Found
                  </h2>

                  <p className="text-gray-500">
                    Try searching with a different company name.
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

export default ManageCompanies;