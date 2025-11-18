// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // ----------------------------------------------------
  // STORED VALUES
  // ----------------------------------------------------
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [userId, setUserId] = useState(() => {
    const stored = localStorage.getItem("userId");
    return stored ? Number(stored) : null;
  });

  const [role, setRole] = useState(() => localStorage.getItem("role") || null);

  const [isFacilitator, setIsFacilitator] = useState(() => {
    const stored = localStorage.getItem("isFacilitator");
    return stored === "true"; // safe conversion
  });

  // ----------------------------------------------------
  // JWT DECODER
  // ----------------------------------------------------
  function decodeJWT(jwt) {
    try {
      const payload = jwt.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error("JWT decode failed:", e);
      return null;
    }
  }

  // ----------------------------------------------------
  // LOGIN
  // ----------------------------------------------------
  function login(jwtToken, roleFromLogin) {
    console.log("RAW TOKEN RECEIVED:", jwtToken);

    // MUST store role immediately
    if (!roleFromLogin) {
      console.error("ERROR: login was called WITHOUT a role!");
    }

    setRole(roleFromLogin);
    localStorage.setItem("role", roleFromLogin);

    // Store JWT
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);

    // Decode
    const decoded = decodeJWT(jwtToken);
    console.log("DECODED JWT PAYLOAD:", decoded);

    // Store user ID
    if (decoded?.id) {
      setUserId(decoded.id);
      localStorage.setItem("userId", decoded.id);
    }

    // Facilitator flag (volunteers only)
    if (decoded?.facilitator !== undefined) {
      const isFac = !!decoded.facilitator;
      setIsFacilitator(isFac);
      localStorage.setItem("isFacilitator", isFac);
    } else {
      // If token didn't contain facilitator flag → assume false
      setIsFacilitator(false);
      localStorage.setItem("isFacilitator", false);
    }
  }

  // ----------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------
  function logout() {
    setToken(null);
    setUserId(null);
    setRole(null);
    setIsFacilitator(false);

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("isFacilitator");
  }

  // ----------------------------------------------------
  // EXPOSE TO APPLICATION
  // ----------------------------------------------------
  const value = {
    token,
    userId,
    role,
    isFacilitator,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
