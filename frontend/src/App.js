// src/App.js
// ─────────────────────────────────────────────────────────────────────────────
// Root component. Sets up React Router so each URL shows a different page.
// Think of it like a traffic director: /new-bill → NewBill page, etc.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Dashboard      from "./pages/Dashboard";
import NewBill        from "./pages/NewBill";
import Transactions   from "./pages/Transactions";
import BillDetail     from "./pages/BillDetail";
import Products       from "./pages/Products";
import Customers      from "./pages/Customers";
import Settings       from "./pages/Settings";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        {/* ── SIDEBAR NAVIGATION ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span className="logo-icon">🧾</span>
            <span className="logo-text">My Bill</span>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/"             end><span>📊</span> Dashboard</NavLink>
            <NavLink to="/new-bill">       <span>➕</span> New Bill</NavLink>
            <NavLink to="/transactions">   <span>🕒</span> Transactions</NavLink>
            <NavLink to="/products">       <span>📦</span> Products</NavLink>
            <NavLink to="/customers">      <span>👥</span> Customers</NavLink>
            <NavLink to="/settings">       <span>⚙️</span> Settings</NavLink>
          </nav>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="main-content">
          <Routes>
            <Route path="/"               element={<Dashboard />} />
            <Route path="/new-bill"        element={<NewBill />} />
            <Route path="/transactions"    element={<Transactions />} />
            <Route path="/bills/:id"       element={<BillDetail />} />
            <Route path="/products"        element={<Products />} />
            <Route path="/customers"       element={<Customers />} />
            <Route path="/settings"        element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
