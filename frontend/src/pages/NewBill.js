// src/pages/NewBill.js
// ─────────────────────────────────────────────────────────────────────────────
// THE CORE PAGE — where a shop owner creates a new bill.
// Logic flow:
//  1. Shop owner fills in customer name (optional) and phone
//  2. They add items from product catalogue OR type manually
//  3. Qty, price, GST% auto-calculates subtotal, tax, grand total
//  4. On "Save Bill", the data is sent to POST /api/bills
//  5. The returned bill ID is used to navigate to the print/detail page
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createBill, getProducts } from "../api";

// Each row in the bill = one item object
const emptyItem = () => ({ name: "", qty: 1, price: "", taxRate: 18, unit: "pcs" });

export default function NewBill() {
  const navigate = useNavigate();
  const [products, setProducts]     = useState([]);
  const [customer, setCustomer]     = useState({ name: "", phone: "" });
  const [items, setItems]           = useState([emptyItem()]);
  const [discount, setDiscount]     = useState(0);
  const [notes, setNotes]           = useState("");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  // ── ITEM HELPERS ──────────────────────────────────────────────────────────
  const updateItem = (index, field, value) => {
    // Creates a new array copy (React state must be immutable)
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addItem    = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index));

  // When user picks from product dropdown, fill the row with product data
  const pickProduct = (index, productId) => {
    const p = products.find(p => p.id === productId);
    if (p) updateItem(index, "_all", p); // special key handled below
    setItems(prev => prev.map((item, i) =>
      i === index
        ? { ...item, name: p.name, price: p.price, taxRate: p.taxRate, unit: p.unit }
        : item
    ));
  };

  // ── CALCULATIONS ─────────────────────────────────────────────────────────
  // These run on every render — no useEffect needed since they're derived values.
  const subtotal = items.reduce((sum, item) => {
    const lineTotal = parseFloat(item.price || 0) * parseFloat(item.qty || 0);
    return sum + lineTotal;
  }, 0);

  const taxAmount = items.reduce((sum, item) => {
    const lineTotal = parseFloat(item.price || 0) * parseFloat(item.qty || 0);
    return sum + (lineTotal * parseFloat(item.taxRate || 0)) / 100;
  }, 0);

  const discountAmount = (subtotal * discount) / 100;
  const grandTotal = subtotal + taxAmount - discountAmount;

  // ── SAVE BILL ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setError("");
    const validItems = items.filter(i => i.name && i.price && i.qty);
    if (validItems.length === 0) { setError("Add at least one item with name, price and qty."); return; }

    setSaving(true);
    try {
      const bill = await createBill({
        customerName:  customer.name,
        customerPhone: customer.phone,
        items: validItems.map(i => ({
          ...i,
          qty:     parseFloat(i.qty),
          price:   parseFloat(i.price),
          taxRate: parseFloat(i.taxRate),
        })),
        discount: parseFloat(discount),
        notes,
      });
      // Navigate to the bill detail/print page
      navigate(`/bills/${bill.id}`);
    } catch (err) {
      setError("Failed to save bill. Is the backend running?");
      setSaving(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <h1>Create New Bill</h1>
        <p>Fill in customer details and add items to generate a bill</p>
      </div>

      {/* Customer Info */}
      <div className="card mb-16">
        <h3 style={{marginBottom:16, fontWeight:700}}>Customer Details</h3>
        <div className="grid-2">
          <div className="form-group">
            <label>Customer Name <span style={{color:"#9ca3af", fontWeight:400}}>(optional)</span></label>
            <input
              className="form-control"
              placeholder="e.g. Ramesh Kumar"
              value={customer.name}
              onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              className="form-control"
              placeholder="e.g. 9876543210"
              value={customer.phone}
              onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Bill Items */}
      <div className="card mb-16">
        <div className="flex-between mb-16">
          <h3 style={{fontWeight:700}}>Bill Items</h3>
          <button className="btn btn-outline btn-sm" onClick={addItem}>+ Add Row</button>
        </div>

        <div className="table-wrap">
          <table className="bill-items-table">
            <thead>
              <tr>
                <th>#</th>
                <th style={{minWidth:200}}>Product / Service</th>
                <th style={{width:70}}>Qty</th>
                <th style={{width:80}}>Unit</th>
                <th style={{width:110}}>Price (₹)</th>
                <th style={{width:90}}>GST %</th>
                <th style={{width:110}}>Total (₹)</th>
                <th style={{width:40}}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const lineTotal = (parseFloat(item.price || 0) * parseFloat(item.qty || 0)).toFixed(2);
                return (
                  <tr key={i}>
                    <td style={{color:"#9ca3af", textAlign:"center"}}>{i + 1}</td>
                    <td>
                      {/* Autocomplete from product catalogue */}
                      <input
                        list={`prod-list-${i}`}
                        placeholder="Type or pick product"
                        value={item.name}
                        onChange={e => {
                          updateItem(i, "name", e.target.value);
                          // If user picks from datalist
                          const found = products.find(p => p.name === e.target.value);
                          if (found) {
                            setItems(prev => prev.map((it, idx) =>
                              idx === i
                                ? { ...it, name: found.name, price: found.price, taxRate: found.taxRate, unit: found.unit }
                                : it
                            ));
                          }
                        }}
                      />
                      {/* HTML datalist = browser built-in autocomplete dropdown */}
                      <datalist id={`prod-list-${i}`}>
                        {products.map(p => <option key={p.id} value={p.name} />)}
                      </datalist>
                    </td>
                    <td>
                      <input
                        type="number" min="1" placeholder="1"
                        value={item.qty}
                        onChange={e => updateItem(i, "qty", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        placeholder="pcs"
                        value={item.unit}
                        onChange={e => updateItem(i, "unit", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number" min="0" placeholder="0.00"
                        value={item.price}
                        onChange={e => updateItem(i, "price", e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        value={item.taxRate}
                        onChange={e => updateItem(i, "taxRate", e.target.value)}
                        style={{padding:"7px 6px", border:"1.5px solid #e2e5ec", borderRadius:6, fontFamily:"inherit", fontSize:13, width:"100%"}}
                      >
                        {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                      </select>
                    </td>
                    <td style={{fontWeight:600, textAlign:"right"}}>₹{lineTotal}</td>
                    <td>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(i)}
                          style={{background:"none", border:"none", cursor:"pointer", color:"#e02424", fontSize:18}}
                          title="Remove row"
                        >×</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Panel */}
        <div className="bill-totals" style={{maxWidth:360, marginLeft:"auto"}}>
          <div className="row"><span>Subtotal</span>        <span>₹{subtotal.toFixed(2)}</span></div>
          <div className="row"><span>GST / Tax</span>       <span>₹{taxAmount.toFixed(2)}</span></div>
          <div className="row">
            <span>Discount (%)</span>
            <input
              type="number" min="0" max="100"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              style={{width:60, padding:"2px 6px", border:"1.5px solid #e2e5ec", borderRadius:5, textAlign:"right", fontFamily:"inherit"}}
            />
          </div>
          {discount > 0 && (
            <div className="row" style={{color:"#0e9f6e"}}>
              <span>Discount Amount</span><span>- ₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="row grand"><span>Grand Total</span> <span>₹{grandTotal.toFixed(2)}</span></div>
        </div>
      </div>

      {/* Notes */}
      <div className="card mb-16">
        <div className="form-group" style={{marginBottom:0}}>
          <label>Notes / Terms</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="e.g. Thank you for shopping with us!"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </div>

      {error && <div style={{color:"#e02424", marginBottom:12, fontWeight:600}}>{error}</div>}

      {/* Actions */}
      <div style={{display:"flex", gap:12}}>
        <button
          className="btn btn-success btn-lg"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "💾 Save & Print Bill"}
        </button>
        <button className="btn btn-outline btn-lg" onClick={() => navigate("/")}>Cancel</button>
      </div>
    </div>
  );
}
