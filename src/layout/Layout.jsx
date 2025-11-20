import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <div className="app-layout">
      {!hideNavbar && <Navbar />}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
