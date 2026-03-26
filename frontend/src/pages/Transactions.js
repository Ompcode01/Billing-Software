// src/pages/Transactions.js
// Lists ALL past bills with search and filter capabilities.
// This is where the "store data in previous transactions" requirement lives.

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBills, deleteBill } from "../api";

export default function Transactions() {
  const [bills, setBills]   = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadBills = () => getBills().then(b => { setBills(b); setLoading(false); });
  useEffect(() => { loadBills(); }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm("Delete this bill?")) return;
    await deleteBill(id);
    loadBills();
  };

  // Filter bills by customer name or bill number
  const filtered = bills.filter(b =>
    b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
    (b.customerName || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filtered.reduce((s, b) => s + b.grandTotal, 0);

  if (loading) return <div className="text-muted">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Transaction History</h1>
        <p>All {bills.length} bills stored · ₹{totalAmount.toLocaleString("en-IN", {maximumFractionDigits:2})} total</p>
      </div>

      <div className="card">
        {/* Search bar */}
        <div className="flex-between mb-16">
          <input
            className="form-control"
            style={{maxWidth:320}}
            placeholder="🔍 Search by customer or bill number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Link to="/new-bill" className="btn btn-primary">➕ New Bill</Link>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Date & Time</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>GST</th>
                <th>Discount</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(bill => (
                <tr key={bill.id}>
                  <td><strong style={{color:"#1a56db"}}>{bill.billNumber}</strong></td>
                  <td>{bill.customerName || <span className="text-muted">Walk-in</span>}</td>
                  <td className="text-muted">{bill.customerPhone || "—"}</td>
                  <td className="text-muted" style={{fontSize:12}}>
                    {new Date(bill.createdAt).toLocaleString("en-IN", {
                      day:"2-digit", month:"short", year:"numeric",
                      hour:"2-digit", minute:"2-digit"
                    })}
                  </td>
                  <td>{bill.items.length}</td>
                  <td>₹{bill.subtotal.toFixed(2)}</td>
                  <td style={{color:"#0e9f6e"}}>₹{bill.taxAmount.toFixed(2)}</td>
                  <td style={{color:"#e02424"}}>{bill.discount > 0 ? `${bill.discount}%` : "—"}</td>
                  <td><strong>₹{bill.grandTotal.toFixed(2)}</strong></td>
                  <td><span className="badge badge-success">{bill.status}</span></td>
                  <td>
                    <div style={{display:"flex", gap:6}}>
                      <Link to={`/bills/${bill.id}`} className="btn btn-outline btn-sm">View</Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={e => handleDelete(bill.id, e)}
                      >Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} style={{textAlign:"center", padding:32, color:"#9ca3af"}}>
                  {search ? "No bills match your search." : "No bills yet."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
