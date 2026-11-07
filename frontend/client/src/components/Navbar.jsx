import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api.js";
import { formatDistanceToNow } from "date-fns";

const SERVER_URL = "http://localhost:5011";

function Navbar() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const userRole = localStorage.getItem("userRole");

  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true",
  );

  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch logged-in user profile
  const fetchUserProfile = async () => {
    try {
      const response = await API.get("/users/profile");

      if (response.data?.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Fetch user profile failed:", error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications");

      if (response.data?.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Fetch notifications failed:", error);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchUserProfile();
      fetchNotifications();
    }
  }, [loggedIn]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mark notification as read
  const handleNotificationClick = async (id) => {
    try {
      const response = await API.put(`/notifications/${id}/read`);

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === id
              ? { ...notification, isRead: true }
              : notification,
          ),
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Mark notification failed:", error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await API.put("/notifications/read-all");

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            isRead: true,
          })),
        );

        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Mark all as read failed:", error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id) => {
    try {
      const response = await API.delete(`/notifications/${id}`);

      if (response.data.success) {
        const deletedNotification = notifications.find(
          (notification) => notification._id === id,
        );

        setNotifications((prev) =>
          prev.filter((notification) => notification._id !== id),
        );

        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Delete notification failed:", error);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await API.post("/users/logout");

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");

      setLoggedIn(false);
      setUser(null);
      setNotifications([]);
      setUnreadCount(0);
      setShowProfileMenu(false);

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const profilePhoto = user?.profile?.profilePhoto;

  const profileImage = profilePhoto
    ? `${SERVER_URL}/uploads/${profilePhoto}`
    : "";

  const displayName = user?.fullname || "My Account";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  const profilePath =
    userRole === "Recruiter"
      ? "/recruiter/profile"
      : userRole === "Student"
        ? "/student-dashboard"
        : "/admin/dashboard";

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-blue-600"
        >
          Job<span className="text-gray-900">Portal</span>
          <span className="text-blue-600">.</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 lg:flex">
          <Link
            to="/"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            Home
          </Link>

          <Link
            to="/#featured-jobs"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            Explore Jobs
          </Link>

          {loggedIn && userRole === "Student" && (
            <>
              <Link
                to="/student-dashboard"
                className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
              >
                My Applications
              </Link>

              <Link
                to="/student/track-applications"
                className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
              >
                Track Applications
              </Link>

              <Link
                to="/student-dashboard"
                className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
              >
                Dashboard
              </Link>
            </>
          )}

          {loggedIn && userRole === "Recruiter" && (
            <>
              <Link
                to="/recruiter/post-job"
                className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
              >
                Post a Job
              </Link>

              <Link
                to="/recruiter/my-jobs"
                className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
              >
                My Jobs
              </Link>

              <Link
                to="/recruiter/applicants"
                className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
              >
                Applicants
              </Link>
            </>
          )}

          {loggedIn && userRole === "Admin" && (
            <Link
              to="/admin/dashboard"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Notifications */}
          {loggedIn && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const nextState = !showNotifications;
                  setShowNotifications(nextState);
                  setShowProfileMenu(false);

                  if (nextState) fetchNotifications();
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-xl text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                title="Notifications"
              >
                <span>🔔</span>

                {unreadCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-[min(340px,calc(100vw-24px))] rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Notifications</h3>

                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="py-5 text-center text-sm text-gray-500">
                      No notifications yet.
                    </p>
                  ) : (
                    <div className="max-h-80 space-y-2 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() =>
                            !notification.isRead &&
                            handleNotificationClick(notification._id)
                          }
                          className={`rounded-xl p-3 text-sm ${
                            notification.isRead ? "bg-gray-50" : "bg-blue-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-gray-800">
                                {notification.message}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {formatDistanceToNow(
                                  new Date(notification.createdAt),
                                  { addSuffix: true },
                                )}
                              </p>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification._id);
                              }}
                              className="shrink-0 text-red-500 hover:text-red-700"
                              title="Delete notification"
                            >
                              🗑️
                            </button>
                          </div>

                          {!notification.isRead && (
                            <span className="mt-2 inline-block text-xs font-semibold text-blue-600">
                              New
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Profile Dropdown */}
          {loggedIn && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu((prev) => !prev);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-2 transition hover:border-blue-300 hover:bg-blue-50/50 sm:gap-3 sm:pr-3"
              >
                {/* Profile Picture */}
                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-blue-100 bg-blue-100">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-blue-700">
                      {initials || "U"}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="hidden text-left sm:block">
                  <p className="max-w-[110px] truncate text-sm font-bold text-gray-800">
                    {displayName}
                  </p>

                  <p className="text-[11px] font-medium text-gray-500">
                    {userRole || "User"}
                  </p>
                </div>

                <svg
                  className={`hidden h-4 w-4 text-gray-400 transition sm:block ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                  <div className="border-b border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-blue-100 shadow-sm">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-bold text-blue-700">
                            {initials || "U"}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {displayName}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">{userRole}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate(profilePath);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <span className="text-lg">👤</span>
                      My Profile
                    </button>

                    {userRole === "Student" && (
                      <>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate("/student-dashboard");
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          <span className="text-lg">📋</span>
                          My Applications
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate("/student/track-applications");
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          <span className="text-lg">📊</span>
                          Track Applications
                        </button>
                      </>
                    )}

                    <div className="my-2 border-t border-gray-100" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <span className="text-lg">↪</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Login / Register */}
          {!loggedIn && (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setShowMobileMenu((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-xl text-gray-700 hover:bg-gray-50 lg:hidden"
            aria-label="Toggle menu"
          >
            {showMobileMenu ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="border-t border-gray-100 bg-white px-5 py-4 shadow-lg lg:hidden">
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setShowMobileMenu(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50"
            >
              Home
            </Link>

            <Link
              to="/#featured-jobs"
              onClick={() => setShowMobileMenu(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50"
            >
              Explore Jobs
            </Link>

            {loggedIn && userRole === "Student" && (
              <>
                <Link
                  to="/student-dashboard"
                  onClick={() => setShowMobileMenu(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50"
                >
                  My Applications
                </Link>

                <Link
                  to="/student/track-applications"
                  onClick={() => setShowMobileMenu(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50"
                >
                  Track Applications
                </Link>
              </>
            )}

            {loggedIn && userRole === "Recruiter" && (
              <>
                <Link
                  to="/recruiter/post-job"
                  onClick={() => setShowMobileMenu(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50"
                >
                  Post a Job
                </Link>

                <Link
                  to="/recruiter/my-jobs"
                  onClick={() => setShowMobileMenu(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50"
                >
                  My Jobs
                </Link>

                <Link
                  to="/recruiter/applicants"
                  onClick={() => setShowMobileMenu(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50"
                >
                  Applicants
                </Link>
              </>
            )}

            {loggedIn && (
              <>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    navigate(profilePath);
                  }}
                  className="rounded-lg px-3 py-3 text-left text-sm font-medium text-gray-700 hover:bg-blue-50"
                >
                  My Profile
                </button>

                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                  className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            )}

            {!loggedIn && (
              <>
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setShowMobileMenu(false)}
                  className="rounded-lg bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
