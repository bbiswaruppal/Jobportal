import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: "📊",
    },
    {
      name: "Manage Users",
      path: "/admin/users",
      icon: "👥",
    },
    {
      name: "Manage Companies",
      path: "/admin/companies",
      icon: "🏢",
    },
    {
      name: "Manage Jobs",
      path: "/admin/jobs",
      icon: "💼",
    },
    {
      name: "Manage Applications",
      path: "/admin/applications",
      icon: "📋",
    },
  ];

  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    // TODO: Call your backend logout API here if your app has one.
    navigate("/login");
  };

  const sidebarContent = (
    <>
      <div className="border-b border-gray-700 p-6">
        <h2 className="text-2xl font-bold">JobPortal</h2>
        <p className="mt-1 text-sm text-gray-400">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-700 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
        >
          🚪 Logout
        </button>

        <p className="mt-4 text-center text-xs text-gray-400">
          JobPortal Admin Panel
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-gray-900 px-4 py-2 text-white shadow-lg md:hidden"
        aria-label="Toggle admin menu"
      >
        {menuOpen ? "✕ Close" : "☰ Menu"}
      </button>

      {/* Mobile overlay */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-gray-900 text-white md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 text-white transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default AdminSidebar;