// src/pages/Dashboard.js
// ─────────────────────────────────────────────────────────────────────────────
// Shows summary stats: total bills today, total revenue, recent transactions.
// This is the first page the user sees when they open the app.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBills, getSettings } from "../api";

export default function Dashboard() {
  const [bills, setBills]       = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // Fetch bills and settings together when page loads
    Promise.all([getBills(), getSettings()]).then(([b, s]) => {
      setBills(b);
      setSettings(s);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-muted">Loading...</div>;

  // Calculate stats
  const today     = new Date().toDateString();
  const todayBills = bills.filter(b => new Date(b.createdAt).toDateString() === today);
  const totalRev   = bills.reduce((s, b) => s + b.grandTotal, 0);
  const todayRev   = todayBills.reduce((s, b) => s + b.grandTotal, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back 👋</h1>
        <p>{settings.shopName || "Your Shop"} · Dashboard Overview</p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Today's Sales</div>
          <div className="value">₹{todayRev.toLocaleString("en-IN", {maximumFractionDigits:2})}</div>
          <div className="sub">{todayBills.length} bills today</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Revenue</div>
          <div className="value">₹{totalRev.toLocaleString("en-IN", {maximumFractionDigits:2})}</div>
          <div className="sub">{bills.length} bills total</div>
        </div>
        <div className="stat-card">
          <div className="label">This Month</div>
          <div className="value">₹{bills
            .filter(b => new Date(b.createdAt).getMonth() === new Date().getMonth())
            .reduce((s,b)=>s+b.grandTotal,0)
            .toLocaleString("en-IN", {maximumFractionDigits:2})}
          </div>
          <div className="sub">Monthly revenue</div>
        </div>
        <div className="stat-card">
          <div className="label">Avg Bill Value</div>
          <div className="value">₹{bills.length ? (totalRev/bills.length).toLocaleString("en-IN", {maximumFractionDigits:0}) : 0}</div>
          <div className="sub">Per transaction</div>
        </div>
      </div>

      {/* ── QUICK ACTION ── */}
      <div style={{marginBottom:24}}>
        <Link to="/new-bill" className="btn btn-primary btn-lg">➕ Create New Bill</Link>
      </div>

      {/* ── RECENT TRANSACTIONS ── */}
      <div className="card">
        <div className="flex-between mb-16">
          <h2 style={{fontSize:16, fontWeight:700}}>Recent Transactions</h2>
          <Link to="/transactions" className="btn btn-outline btn-sm">View All →</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bills.slice(0, 8).map(bill => (
                <tr key={bill.id}>
                  <td><strong>{bill.billNumber}</strong></td>
                  <td>{bill.customerName || "Walk-in"}</td>
                  <td>{new Date(bill.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>{bill.items.length} item{bill.items.length > 1 ? "s" : ""}</td>
                  <td><strong>₹{bill.grandTotal.toLocaleString("en-IN", {maximumFractionDigits:2})}</strong></td>
                  <td><span className="badge badge-success">{bill.status}</span></td>
                  <td>
                    <Link to={`/bills/${bill.id}`} className="btn btn-outline btn-sm">View</Link>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr><td colSpan={7} style={{textAlign:"center", padding:32, color:"#9ca3af"}}>
                  No bills yet. <Link to="/new-bill">Create your first bill →</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
