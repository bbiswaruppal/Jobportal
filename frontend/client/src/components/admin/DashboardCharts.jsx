import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const DashboardCharts = ({ dashboard }) => {
  const barData = [
    {
      name: "Students",
      total: dashboard?.totalStudents ?? 0,
    },
    {
      name: "Recruiters",
      total: dashboard?.totalRecruiters ?? 0,
    },
    {
      name: "Companies",
      total: dashboard?.totalCompanies ?? 0,
    },
    {
      name: "Jobs",
      total: dashboard?.totalJobs ?? 0,
    },
    {
      name: "Applications",
      total: dashboard?.totalApplications ?? 0,
    },
  ];

  const pieData = [
    {
      name: "Students",
      value: dashboard?.totalStudents ?? 0,
    },
    {
      name: "Recruiters",
      value: dashboard?.totalRecruiters ?? 0,
    },
  ].filter((item) => item.value > 0);

  const COLORS = ["#3B82F6", "#A855F7"];

  // Application Status Chart Data
  const applicationStatusData = [
    {
      name: "Pending",
      value: dashboard?.pendingApplications ?? 0,
    },
    {
      name: "Accepted",
      value: dashboard?.acceptedApplications ?? 0,
    },
    {
      name: "Rejected",
      value: dashboard?.rejectedApplications ?? 0,
    },
  ];

  const STATUS_COLORS = ["#EAB308", "#22C55E", "#EF4444"];

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
      {/* Bar Chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          Portal Statistics
        </h2>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="total"
                name="Count"
                fill="#3B82F6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          User Distribution
        </h2>

        {pieData.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[entry.name === "Students" ? 0 : 1]}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-80 items-center justify-center text-gray-500">
            No user data available yet.
          </div>
        )}
      </div>

      {/* Application Status Chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          Application Status
        </h2>

        {applicationStatusData.some((item) => item.value > 0) ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicationStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {applicationStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-80 items-center justify-center text-gray-500">
            No application data available yet.
          </div>
        )}
      </div>
    </div>
  );
};;

export default DashboardCharts;