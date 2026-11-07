import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import API from "../api.js";
import HireNovaChatbot from "../components/HireNovaChatbot.jsx";

const RecruiterLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [recruiter, setRecruiter] = useState(null);

  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/recruiter/dashboard",
      icon: "▦",
      section: "MAIN MENU",
    },
    {
      name: "Post a Job",
      path: "/recruiter/post-job",
      icon: "＋",
    },
    {
      name: "My Jobs",
      path: "/recruiter/my-jobs",
      icon: "▣",
    },
    {
      name: "Applicants",
      path: "/recruiter/applicants",
      icon: "♧",
    },
    {
      name: "My Profile",
      path: "/recruiter/profile",
      icon: "♙",
      section: "ACCOUNT",
    },
    {
      name: "Company Settings",
      path: "/recruiter/company-settings",
      icon: "⚙",
    },
  ];

  useEffect(() => {
    const loadRecruiter = async () => {
      try {
        const response = await API.get("/users/profile");

        const data =
          response.data.user || response.data.profile || response.data;

        setRecruiter(data);
      } catch (error) {
        console.error("Failed to load recruiter:", error);
      }
    };

    loadRecruiter();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");

    setProfileOpen(false);
    navigate("/login");
  };

  const getName = () => {
    return (
      recruiter?.fullname ||
      recruiter?.fullName ||
      recruiter?.name ||
      "Recruiter"
    );
  };

  const getInitial = () => getName().charAt(0).toUpperCase();

  const profileImage = recruiter?.profile?.profilePhoto
    ? `http://localhost:5011/uploads/${recruiter.profile.profilePhoto}`
    : "";

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r border-slate-200 bg-white
          transition-all duration-300
          ${collapsed ? "w-[82px]" : "w-[260px]"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5">
          {!collapsed && (
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-600">
              Job<span className="text-slate-800">Portal</span>
            </h1>
          )}

          {collapsed && (
            <span className="mx-auto text-2xl font-black text-blue-600">J</span>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {!collapsed && (
            <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Workspace
            </p>
          )}

          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.path}>
                {item.section === "ACCOUNT" && !collapsed && (
                  <p className="mb-3 mt-7 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Account
                  </p>
                )}

                <NavLink
                  to={item.path}
                  end={item.path === "/recruiter/dashboard"}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.name : ""}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                    }`
                  }
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center text-xl">
                    {item.icon}
                  </span>

                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              </div>
            ))}
          </div>
        </nav>

        {/* Sidebar Bottom */}
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : ""}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <span className="flex h-7 w-7 items-center justify-center text-xl">
              ↪
            </span>

            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "md:ml-[82px]" : "md:ml-[260px]"
        }`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-2xl text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Open sidebar"
            >
              ☰
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded-lg p-2 text-xl text-slate-600 hover:bg-slate-100 md:block"
              title="Collapse sidebar"
            >
              ☰
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Recruiter Workspace
              </h2>
              <p className="hidden text-xs text-slate-400 sm:block">
                Manage your hiring activities
              </p>
            </div>
          </div>

          {/* Profile */}
          <div className="relative flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-800">{getName()}</p>
              <p className="text-xs text-slate-400">Recruiter Account</p>
            </div>

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-blue-100 bg-blue-600 text-lg font-bold text-white shadow-sm transition hover:ring-4 hover:ring-blue-100"
              aria-label="Open recruiter profile"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Recruiter"
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitial()
              )}
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />

                <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
                  <div className="border-b border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xl font-bold text-white">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitial()
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-800">
                          {getName()}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {recruiter?.email || "Email not available"}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-blue-600">
                          Recruiter Account
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/recruiter/profile");
                      }}
                      className="w-full rounded-xl px-4 py-3 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      👤 &nbsp; My Profile
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/recruiter/company-settings");
                      }}
                      className="w-full rounded-xl px-4 py-3 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      🏢 &nbsp; Company Settings
                    </button>

                    <hr className="my-2 border-slate-100" />

                    <button
                      onClick={handleLogout}
                      className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-500 hover:bg-red-50"
                    >
                      ↪ &nbsp; Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-76px)] p-4 md:p-7 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* HireNova AI - Available on all recruiter pages */}
      <HireNovaChatbot />
    </div>
  );
};

export default RecruiterLayout;
