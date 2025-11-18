import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Parent from "./pages/Parent";
import Volunteer from "./pages/Volunteer";
import Login from "./pages/Login";
import ParentRegister from "./pages/ParentRegister";
import VolunteerRegister from "./pages/VolunteerRegister";
import Facilitator from "./pages/Facilitator";

import { useAuth } from "./auth/AuthProvider";

export default function App() {
  const { token, role, isFacilitator } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* 👇 Redirect landing page to /login */}
        <Route index element={<Navigate to="/login" replace />} />

        {/* LOGIN PAGE */}
        <Route path="login" element={<Login />} />

        {/* REGISTRATION */}
        <Route path="register" element={<Register />} />
        <Route path="register/parent" element={<ParentRegister />} />
        <Route path="register/volunteer" element={<VolunteerRegister />} />

        {/* PARENT DASHBOARD (protected) */}
        <Route
          path="parent"
          element={
            token && role === "parent" ? (
              <Parent />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* VOLUNTEER DASHBOARD (protected) */}
        <Route
          path="volunteer"
          element={
            token && role === "volunteer" ? (
              <Volunteer />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* FACILITATOR DASHBOARD — must be BOTH volunteer + facilitator */}
        <Route
          path="facilitator"
          element={
            token && role === "volunteer" && isFacilitator ? (
              <Facilitator />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* You can keep Home if you want, but it's no longer directly accessible */}
        <Route path="home" element={<Home />} />
      </Route>
    </Routes>
  );
}
