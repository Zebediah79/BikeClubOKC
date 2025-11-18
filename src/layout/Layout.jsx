// src/layout/Layout.jsx
// src/layout/Layout.jsx
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

/*import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import "../styles.css"; // your global styles

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="page-center">
        <Outlet />
      </main>
    </>
  );
}*/
