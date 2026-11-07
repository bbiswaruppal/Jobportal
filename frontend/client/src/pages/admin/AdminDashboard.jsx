import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";
import DashboardCharts from "../../components/admin/DashboardCharts";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5011/api/admin/dashboard",
          {
            withCredentials: true,
          },
        );

        if (response.data.success) {
          setDashboard(response.data.dashboard);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: dashboard?.totalUsers,
      icon: "👥",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Students",
      value: dashboard?.totalStudents,
      icon: "🎓",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Recruiters",
      value: dashboard?.totalRecruiters,
      icon: "🧑‍💼",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Companies",
      value: dashboard?.totalCompanies,
      icon: "🏢",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Total Jobs",
      value: dashboard?.totalJobs,
      icon: "💼",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Applications",
      value: dashboard?.totalApplications,
      icon: "📋",
      color: "from-pink-500 to-pink-600",
    },
    {
      title: "Pending Applications",
      value: dashboard?.pendingApplications,
      icon: "⏳",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      title: "Accepted Applications",
      value: dashboard?.acceptedApplications,
      icon: "✅",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Rejected Applications",
      value: dashboard?.rejectedApplications,
      icon: "❌",
      color: "from-red-500 to-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-100 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Dashboard Content */}
      <main className="min-w-0 flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Dashboard Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your Job Portal from one place.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-gray-900">
                      {stat.value ?? 0}
                    </h2>

                    <p className="mt-2 text-xs text-gray-400">
                      Job Portal Overview
                    </p>
                  </div>

                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-3xl shadow-md transition-transform duration-300 group-hover:scale-110`}
                  >
                    {stat.icon}
                  </div>
                </div>

                <div
                  className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color}`}
                />
              </div>
            ))}
          </div>

          {/* Dashboard Charts */}
          <DashboardCharts dashboard={dashboard} />

          {/* Quick Overview */}
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Quick Overview
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Monitor your Job Portal statistics at a glance.
                </p>
              </div>

              <span className="w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                ● Dashboard Active
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-blue-50 p-5">
                <p className="text-sm font-medium text-blue-600">
                  Total Job Posts
                </p>

                <h3 className="mt-2 text-3xl font-bold text-blue-900">
                  {dashboard?.totalJobs ?? 0}
                </h3>
              </div>

              <div className="rounded-xl bg-purple-50 p-5">
                <p className="text-sm font-medium text-purple-600">
                  Total Applications
                </p>

                <h3 className="mt-2 text-3xl font-bold text-purple-900">
                  {dashboard?.totalApplications ?? 0}
                </h3>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Job Portal Admin Panel
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
