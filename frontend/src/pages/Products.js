// src/pages/Products.js
// Manage your product/service catalogue. Items here can be auto-filled into bills.

import React, { useEffect, useState } from "react";
import { getProducts, createProduct, deleteProduct } from "../api";

const empty = { name: "", price: "", taxRate: 18, unit: "pcs", stock: 0 };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm]         = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError]       = useState("");

  const load = () => getProducts().then(setProducts);
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.price) { setError("Name and price are required."); return; }
    await createProduct(form);
    setForm(empty);
    setShowForm(false);
    setError("");
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id);
    load();
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Products / Services</h1>
          <p>{products.length} items in catalogue</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-16">
          <h3 style={{marginBottom:16, fontWeight:700}}>Add New Product</h3>
          <div className="grid-3">
            <div className="form-group">
              <label>Product Name *</label>
              <input className="form-control" placeholder="e.g. Rice 1kg" value={form.name}
                onChange={e => setForm(p => ({...p, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input className="form-control" type="number" placeholder="0.00" value={form.price}
                onChange={e => setForm(p => ({...p, price: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>GST Rate (%)</label>
              <select className="form-control" value={form.taxRate}
                onChange={e => setForm(p => ({...p, taxRate: e.target.value}))}>
                {[0,5,12,18,28].map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input className="form-control" placeholder="pcs / kg / litre" value={form.unit}
                onChange={e => setForm(p => ({...p, unit: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Opening Stock</label>
              <input className="form-control" type="number" value={form.stock}
                onChange={e => setForm(p => ({...p, stock: e.target.value}))} />
            </div>
          </div>
          {error && <div style={{color:"#e02424", marginBottom:10}}>{error}</div>}
          <button className="btn btn-success" onClick={handleAdd}>Save Product</button>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price (₹)</th>
                <th>GST %</th>
                <th>Unit</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>₹{parseFloat(p.price).toFixed(2)}</td>
                  <td><span className="badge badge-warning">{p.taxRate}%</span></td>
                  <td className="text-muted">{p.unit}</td>
                  <td>{p.stock}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button></td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} style={{textAlign:"center", padding:32, color:"#9ca3af"}}>
                  No products yet. Add some to speed up billing!
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
