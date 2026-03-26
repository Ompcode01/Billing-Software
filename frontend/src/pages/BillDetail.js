// src/pages/BillDetail.js
// Shows a single bill in a printable invoice format.
// The useRef + window.print() trick lets us print just the bill area.

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBill, deleteBill, getSettings } from "../api";

export default function BillDetail() {
  const { id }      = useParams();        // Gets :id from URL /bills/:id
  const navigate    = useNavigate();
  const printRef    = useRef();           // Reference to the printable div
  const [bill, setBill]         = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getBill(id), getSettings()]).then(([b, s]) => {
      setBill(b);
      setSettings(s);
      setLoading(false);
    }).catch(() => navigate("/transactions"));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this bill? This cannot be undone.")) return;
    await deleteBill(id);
    navigate("/transactions");
  };

  const handlePrint = () => window.print();

  if (loading) return <div className="text-muted">Loading bill...</div>;
  if (!bill)   return <div>Bill not found.</div>;

  return (
    <div>
      {/* Action bar — hidden when printing */}
      <div className="flex-between mb-16 no-print">
        <div>
          <Link to="/transactions" className="btn btn-outline btn-sm">← Back</Link>
        </div>
        <div style={{display:"flex", gap:10}}>
          <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print / Save PDF</button>
          <button className="btn btn-danger"  onClick={handleDelete}>🗑️ Delete</button>
        </div>
      </div>

      {/* ── PRINTABLE INVOICE ── */}
      <div ref={printRef} className="card print-bill" style={{maxWidth:740, margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex", justifyContent:"space-between", borderBottom:"2px solid #1a56db", paddingBottom:16, marginBottom:20}}>
          <div>
            <h1 style={{fontSize:24, fontWeight:800, color:"#1a56db"}}>{settings.shopName || "My Shop"}</h1>
            {settings.address && <p style={{fontSize:12, color:"#555", marginTop:4}}>{settings.address}</p>}
            {settings.phone   && <p style={{fontSize:12, color:"#555"}}>📞 {settings.phone}</p>}
            {settings.gstin   && <p style={{fontSize:12, color:"#555"}}>GSTIN: {settings.gstin}</p>}
          </div>
          <div style={{textAlign:"right"}}>
            <h2 style={{fontSize:20, fontWeight:800, color:"#374151"}}>TAX INVOICE</h2>
            <p style={{fontSize:13, marginTop:4}}><strong>Bill No:</strong> {bill.billNumber}</p>
            <p style={{fontSize:13}}><strong>Date:</strong> {new Date(bill.createdAt).toLocaleDateString("en-IN", {day:"2-digit",month:"short",year:"numeric"})}</p>
          </div>
        </div>

        {/* Customer */}
        <div style={{marginBottom:20, background:"#f8fafc", padding:12, borderRadius:8}}>
          <h4 style={{fontSize:11, textTransform:"uppercase", color:"#9ca3af", marginBottom:8, letterSpacing:.5}}>Bill To</h4>
          <p style={{fontWeight:700, fontSize:15}}>{bill.customerName || "Walk-in Customer"}</p>
          {bill.customerPhone && <p style={{fontSize:13, color:"#555"}}>📞 {bill.customerPhone}</p>}
        </div>

        {/* Items Table */}
        <table style={{width:"100%", borderCollapse:"collapse", marginBottom:20}}>
          <thead>
            <tr style={{background:"#1a56db", color:"#fff"}}>
              <th style={{padding:"9px 12px", textAlign:"left", fontSize:12}}>#</th>
              <th style={{padding:"9px 12px", textAlign:"left", fontSize:12}}>Item</th>
              <th style={{padding:"9px 12px", textAlign:"center", fontSize:12}}>Qty</th>
              <th style={{padding:"9px 12px", textAlign:"center", fontSize:12}}>Unit</th>
              <th style={{padding:"9px 12px", textAlign:"right", fontSize:12}}>Price (₹)</th>
              <th style={{padding:"9px 12px", textAlign:"center", fontSize:12}}>GST%</th>
              <th style={{padding:"9px 12px", textAlign:"right", fontSize:12}}>GST (₹)</th>
              <th style={{padding:"9px 12px", textAlign:"right", fontSize:12}}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, i) => {
              const lineBase = item.price * item.qty;
              const lineGST  = (lineBase * item.taxRate) / 100;
              const lineTotal = lineBase + lineGST;
              return (
                <tr key={i} style={{borderBottom:"1px solid #f0f0f0"}}>
                  <td style={{padding:"9px 12px", fontSize:13, color:"#9ca3af"}}>{i+1}</td>
                  <td style={{padding:"9px 12px", fontSize:13, fontWeight:600}}>{item.name}</td>
                  <td style={{padding:"9px 12px", fontSize:13, textAlign:"center"}}>{item.qty}</td>
                  <td style={{padding:"9px 12px", fontSize:13, textAlign:"center", color:"#9ca3af"}}>{item.unit}</td>
                  <td style={{padding:"9px 12px", fontSize:13, textAlign:"right"}}>₹{item.price.toFixed(2)}</td>
                  <td style={{padding:"9px 12px", fontSize:13, textAlign:"center"}}>{item.taxRate}%</td>
                  <td style={{padding:"9px 12px", fontSize:13, textAlign:"right", color:"#0e9f6e"}}>₹{lineGST.toFixed(2)}</td>
                  <td style={{padding:"9px 12px", fontSize:13, textAlign:"right", fontWeight:700}}>₹{lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{display:"flex", justifyContent:"flex-end"}}>
          <div style={{minWidth:280}}>
            <div style={{display:"flex", justifyContent:"space-between", padding:"5px 0", fontSize:14, borderBottom:"1px solid #e5e7eb"}}>
              <span>Subtotal</span><span>₹{bill.subtotal.toFixed(2)}</span>
            </div>
            <div style={{display:"flex", justifyContent:"space-between", padding:"5px 0", fontSize:14, color:"#0e9f6e"}}>
              <span>Total GST</span><span>₹{bill.taxAmount.toFixed(2)}</span>
            </div>
            {bill.discount > 0 && (
              <div style={{display:"flex", justifyContent:"space-between", padding:"5px 0", fontSize:14, color:"#e02424"}}>
                <span>Discount ({bill.discount}%)</span><span>- ₹{bill.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{display:"flex", justifyContent:"space-between", padding:"10px 0 0", fontSize:18, fontWeight:800, color:"#1a56db", borderTop:"2px solid #1a56db", marginTop:5}}>
              <span>Grand Total</span><span>₹{bill.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Footer */}
        {bill.notes && (
          <div style={{marginTop:20, padding:12, background:"#fffbeb", borderRadius:8, fontSize:13}}>
            <strong>Notes:</strong> {bill.notes}
          </div>
        )}
        <div style={{marginTop:24, textAlign:"center", fontSize:12, color:"#9ca3af", borderTop:"1px solid #e5e7eb", paddingTop:16}}>
          Thank you for your business! · Generated by Vyapar App
        </div>
      </div>
    </div>
  );
}
