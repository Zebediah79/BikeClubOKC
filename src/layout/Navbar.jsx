import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "./Navbar.css";

export default function Navbar() {
  const { role, isFacilitator, token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide navbar completely on login page
  if (location.pathname === "/login") return null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        {/* ---------- PUBLIC LINKS (not logged in) ---------- */}
        {!token && (
          <>
            <NavLink to="/" end>
              Home
            </NavLink>

            <NavLink to="/login">Login</NavLink>
          </>
        )}

        {/* ---------- PARENT DASHBOARD ---------- */}
        {token && role === "parent" && <NavLink to="/parent">Parent</NavLink>}

        {/* ---------- VOLUNTEER DASHBOARD ---------- */}
        {token && role === "volunteer" && (
          <NavLink to="/volunteer">Volunteer</NavLink>
        )}

        {/* ---------- FACILITATOR DASHBOARD ---------- */}
        {token && role === "volunteer" && isFacilitator && (
          <NavLink to="/facilitator">Facilitator</NavLink>
        )}
      </div>

      {/* ---------- RIGHT SIDE PROFILE MENU ---------- */}
      {token && (
        <div className="nav-right">
          <div className="profile-menu" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="profile-label">
              {role === "parent" && "Parent"}
              {role === "volunteer" && !isFacilitator && "Volunteer"}
              {role === "volunteer" && isFacilitator && "Facilitator"} ▼
            </span>

            {menuOpen && (
              <div className="profile-dropdown">
                <button onClick={() => navigate(`/${role}`)}>
                  My Dashboard
                </button>

                {role === "volunteer" && isFacilitator && (
                  <button onClick={() => navigate("/facilitator")}>
                    Facilitator Dashboard
                  </button>
                )}

                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

/*import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "./Navbar.css"; // optional for styling

export default function Navbar() {
  const { role, isFacilitator, token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  // Hide navbar on login page
  if (location.pathname === "/login") return null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/" end>
          Home
        </NavLink>

        {/* Parent Link *}
        {token && role === "parent" && <NavLink to="/parent">Parent</NavLink>}

        {/* Volunteer Link *}
        {token && role === "volunteer" && (
          <NavLink to="/volunteer">Volunteer</NavLink>
        )}

        {/* Facilitator Link *}
        {token && role === "volunteer" && isFacilitator && (
          <NavLink to="/facilitator">Facilitator</NavLink>
        )}
      </div>

      {/* ---------- RIGHT SIDE PROFILE MENU ---------- *}
      {token && (
        <div className="nav-right">
          <div className="profile-menu" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="profile-label">
              {role === "parent" && "Parent"}
              {role === "volunteer" && !isFacilitator && "Volunteer"}
              {role === "volunteer" && isFacilitator && "Facilitator"}
              &nbsp;▼
            </span>

            {menuOpen && (
              <div className="profile-dropdown">
                <button onClick={() => navigate(`/${role}`)}>
                  My Dashboard
                </button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}*/
