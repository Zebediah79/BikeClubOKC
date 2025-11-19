import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import "./Login.css";

// API functions
import { parentLogin, volunteerLogin } from "../auth/authAPI";

export default function Login() {
  const { login } = useAuth();

  const [role, setRole] = useState("parent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [readyToContinue, setReadyToContinue] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // console.error(err);
      //console.log("---- LOGIN ATTEMPT ----");
      //console.log("Role:", role);
      //console.log("Email:", email);

      let jwtToken;

      // Call correct backend route
      if (role === "parent") {
        jwtToken = await parentLogin(email, password);
      } else {
        jwtToken = await volunteerLogin(email, password);
      }

      //console.log(" RAW TOKEN RECEIVED:", jwtToken);

      // Store token + role in AuthProvider
      login(jwtToken, role); // ⭐ SEND BOTH TOKEN + ROLE

      //alert("Login successful!");
      setReadyToContinue(true);
    } catch (err) {
      console.error("Login FAILED:", err);
      //alert("Invalid email or password");
    }
  }

  // Handles dashboard routing depending on role and facilitator flag
  function handleContinue() {
    // Read decoded values from AuthProvider
    const storedRole = localStorage.getItem("role");
    const isFacilitator = localStorage.getItem("isFacilitator") === "true";

    //console.log("➡️ Continue clicked:");
    //console.log("Stored role:", storedRole);
    //console.log("Facilitator:", isFacilitator);

    if (storedRole === "parent") {
      window.location.href = "/parent";
      return;
    }

    if (storedRole === "volunteer") {
      if (isFacilitator) {
        window.location.href = "/facilitator"; // ⭐ NEW DASHBOARD FOR FACILITATOR
      } else {
        window.location.href = "/volunteer";
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="parent">Parent</option>
            <option value="volunteer">Volunteer</option>
          </select>

          <input
            type="text"
            placeholder="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        {/* Continue Button */}
        {readyToContinue && (
          <button
            style={{
              marginTop: "20px",
              padding: "12px 20px",
              borderRadius: "8px",
              background: "#0f75bc",
              color: "white",
              fontWeight: "bold",
            }}
            onClick={handleContinue}
          >
            Continue to Dashboard →
          </button>
        )}
      </div>
    </div>
  );
}
