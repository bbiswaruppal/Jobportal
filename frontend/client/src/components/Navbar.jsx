import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "./Button.jsx";
import API from "../api.js";

function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true",
  );
  async function handleLogout() {
    try {
      await API.post("/users/logout");
      localStorage.removeItem("isLoggedIn");
      setLoggedIn(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
  return (
    <nav className="flex items-center justify-between bg-white px-8 py-4 shadow">
      <Link to="/" className="text-2xl font-bold text-blue-600">
        JobPortal
      </Link>

      <div className="flex gap-6">
        <Link to="/" className="text-gray-700 hover:text-blue-600">
          Home
        </Link>

        <Link to="/" className="text-gray-700 hover:text-blue-600">
          Jobs
        </Link>
        {loggedIn && (
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        )}

        <Link to="/login">
          <Button>Login</Button>
        </Link>

        <Link to="/register">
          <Button>Register</Button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
