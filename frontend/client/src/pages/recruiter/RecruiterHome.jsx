import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api.js";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const RecruiterHome = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [applicationChartData, setApplicationChartData] = useState([]);

  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const response = await API.get("/job/getadminjobs");
        const myJobs = response.data.jobs || [];

        let totalApplications = 0;
        let pending = 0;
        let accepted = 0;
        let rejected = 0;

        let allApplicants = [];

        const applicationResponses = await Promise.all(
          myJobs.map((job) =>
            API.get(`/application/${job._id}/applicants`).catch(() => ({
              data: { applications: [] },
            })),
          ),
        );

        applicationResponses.forEach((res, index) => {
          const applications =
            res.data.applications || res.data.applicants || res.data.data || [];

          totalApplications += applications.length;

          applications.forEach((application) => {
            if (application.status === "pending") pending++;
            if (application.status === "accepted") accepted++;
            if (application.status === "rejected") rejected++;

            allApplicants.push({
              ...application,
              jobTitle: myJobs[index]?.title || "Job",
            });
          });
        });

        allApplicants.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );

        const sortedJobs = [...myJobs].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );

        setJobs(sortedJobs);
        setRecentApplicants(allApplicants.slice(0, 5));

        // Last 6 months application chart
        const now = new Date();

        const monthlyData = Array.from({ length: 6 }, (_, index) => {
          const date = new Date(
            now.getFullYear(),
            now.getMonth() - (5 - index),
            1,
          );

          const applications = allApplicants.filter((application) => {
            const applicationDate = new Date(application.createdAt);

            return (
              application.createdAt &&
              applicationDate.getMonth() === date.getMonth() &&
              applicationDate.getFullYear() === date.getFullYear()
            );
          }).length;

          return {
            month: date.toLocaleString("en-US", {
              month: "short",
            }),
            applications,
          };
        });

        setApplicationChartData(monthlyData);

        setStats({
          totalJobs: myJobs.length,
          totalApplications,
          pending,
          accepted,
          rejected,
        });
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalApplications = applicationChartData.reduce(
    (total, item) => total + item.applications,
    0,
  );

  const thisMonthApplications =
    applicationChartData[applicationChartData.length - 1]?.applications || 0;

  const statCards = [
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: "💼",
      color: "bg-blue-50 text-blue-600",
      accent: "border-l-blue-500",
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: "📄",
      color: "bg-purple-50 text-purple-600",
      accent: "border-l-purple-500",
    },
    {
      title: "Pending Applications",
      value: stats.pending,
      icon: "⏳",
      color: "bg-orange-50 text-orange-600",
      accent: "border-l-orange-500",
    },
    {
      title: "Accepted Applications",
      value: stats.accepted,
      icon: "✓",
      color: "bg-emerald-50 text-emerald-600",
      accent: "border-l-emerald-500",
    },
    {
      title: "Rejected Applications",
      value: stats.rejected,
      icon: "✕",
      color: "bg-red-50 text-red-600",
      accent: "border-l-red-500",
    },
  ];

  const getStudent = (application) => {
    const student =
      application.applicant || application.student || application.user || {};

    return typeof student === "object" && student !== null ? student : {};
  };

  const getStudentName = (student) =>
    student.fullname || student.fullName || student.name || "Student";

  const getStatusStyle = (status) => {
    if (status === "accepted") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-600";
    }

    return "bg-amber-50 text-amber-700";
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Welcome Header */}
      <section className="flex flex-col justify-between gap-5 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-blue-600">
            RECRUITER WORKSPACE
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Welcome back! Here's what's happening with your recruitment.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/recruiter/post-job")}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Post a Job
          </button>

          <button
            onClick={() => navigate("/recruiter/my-jobs")}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Manage Jobs
          </button>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Recruitment Statistics
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Overview of your recruitment activity
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            ● Live Overview
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-2xl border border-gray-100 border-l-4 ${card.accent} bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <h3 className="mt-3 text-3xl font-bold text-gray-900">
                    {card.value}
                  </h3>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${card.color}`}
                >
                  {card.icon}
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-400">
                Current recruitment data
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Applications Analytics */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Applications Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Monthly application performance over the last 6 months
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-5">
            <p className="text-sm font-medium text-gray-600">
              Total Applications (6 Months)
            </p>

            <h3 className="mt-2 text-3xl font-bold text-blue-600">
              {totalApplications}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Applications received in this period
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-5">
            <p className="text-sm font-medium text-gray-600">This Month</p>

            <h3 className="mt-2 text-3xl font-bold text-emerald-600">
              {thisMonthApplications}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Applications received this month
            </p>
          </div>
        </div>

        <div className="h-[280px] w-full sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={applicationChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                dy={10}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />

              <Tooltip
                cursor={{ fill: "#EFF6FF" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              />

              <Bar
                dataKey="applications"
                name="Applications"
                fill="#2563EB"
                radius={[7, 7, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5 md:p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Recent Job Posts
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your latest published job openings
            </p>
          </div>

          <button
            onClick={() => navigate("/recruiter/my-jobs")}
            className="rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
          >
            View All Jobs →
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mb-3 text-4xl">💼</div>
            <p className="font-semibold text-gray-700">No jobs posted yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Create your first job opening to get started.
            </p>

            <button
              onClick={() => navigate("/recruiter/post-job")}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job._id}
                className="flex flex-col justify-between gap-4 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                    💼
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">{job.title}</h3>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                      <span>📍 {job.location || "Location not specified"}</span>

                      <span>◷ {job.jobType || "Job type not specified"}</span>
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      Posted{" "}
                      {job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString()
                        : "Recently"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/recruiter/my-jobs")}
                  className="w-fit rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                >
                  Manage Job →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Applicants */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5 md:p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Recent Applicants
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Latest candidates who applied for your jobs
            </p>
          </div>

          <button
            onClick={() => navigate("/recruiter/applicants")}
            className="rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
          >
            View All Applicants →
          </button>
        </div>

        {recentApplicants.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mb-3 text-4xl">👥</div>
            <p className="font-semibold text-gray-700">
              No applications received yet
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Applicants will appear here when candidates apply.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Applied Job</th>
                    <th className="px-6 py-4">Applied On</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {recentApplicants.map((application) => {
                    const student = getStudent(application);
                    const status = application.status || "pending";

                    return (
                      <tr
                        key={application._id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                              {getStudentName(student).charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {getStudentName(student)}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {student.email || "Email unavailable"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {application.jobTitle || "Job"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {application.createdAt
                            ? new Date(
                                application.createdAt,
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(status)}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 p-4 md:hidden">
              {recentApplicants.map((application) => {
                const student = getStudent(application);
                const status = application.status || "pending";
                const name = getStudentName(student);

                return (
                  <div
                    key={application._id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                          {name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-bold text-gray-800">{name}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {student.email || "Email unavailable"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(status)}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Applied for:</span>{" "}
                        {application.jobTitle || "Job"}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        Applied on:{" "}
                        {application.createdAt
                          ? new Date(application.createdAt).toLocaleDateString()
                          : "Date unavailable"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default RecruiterHome;
