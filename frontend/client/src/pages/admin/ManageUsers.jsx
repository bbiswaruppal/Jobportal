import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Search and filter states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const fetchUsers = async () => {
    try {
      setError("");

      const response = await axios.get(
        "http://localhost:5011/api/admin/users",
        { withCredentials: true }
      );

      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await axios.delete(
        `http://localhost:5011/api/admin/users/${id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setUsers((previousUsers) =>
          previousUsers.filter((user) => user._id !== id)
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete user"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Search by name or email and filter by role
  const filteredUsers = users.filter((user) => {
    const name = user.fullname || user.name || "";
    const email = user.email || "";

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          Manage Users
        </h1>

        <p className="mb-6 text-gray-600">
          Total registered users: {users.length}
        </p>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500 md:max-w-md"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
          >
            <option value="All">All Roles</option>
            <option value="Student">Students</option>
            <option value="Recruiter">Recruiters</option>
            <option value="Admin">Admins</option>
          </select>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </p>

            <div className="overflow-x-auto rounded-lg bg-white shadow">
              <table className="w-full text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const isAdmin = user.role === "Admin";
                    const name =
                      user.fullname || user.name || user.email;

                    return (
                      <tr
                        key={user._id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="p-4">{name || "N/A"}</td>
                        <td className="p-4">{user.email || "N/A"}</td>

                        <td className="p-4">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                            {user.role || "Student"}
                          </span>
                        </td>

                        <td className="p-4">
                          {user.phonenumber || "N/A"}
                        </td>

                        <td className="p-4">
                          {isAdmin ? (
                            <span className="text-sm text-gray-500">
                              Protected
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleDelete(user._id, name)
                              }
                              disabled={deletingId === user._id}
                              className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {deletingId === user._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-6 text-center text-gray-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ManageUsers;