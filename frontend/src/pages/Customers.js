// src/pages/Customers.js
import React, { useEffect, useState } from "react";
import { getCustomers, createCustomer, deleteCustomer } from "../api";

const empty = { name: "", phone: "", email: "", address: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm]           = useState(empty);
  const [showForm, setShowForm]   = useState(false);

  const load = () => getCustomers().then(setCustomers);
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name) return;
    await createCustomer(form);
    setForm(empty); setShowForm(false); load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    await deleteCustomer(id); load();
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Customers</h1>
          <p>{customers.length} customers saved</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-16">
          <h3 style={{marginBottom:16, fontWeight:700}}>Add Customer</h3>
          <div className="grid-2">
            {[["name","Name *","Ramesh Kumar"],["phone","Phone","9876543210"],["email","Email",""],["address","Address",""]].map(([f,l,p]) => (
              <div className="form-group" key={f}>
                <label>{l}</label>
                <input className="form-control" placeholder={p} value={form[f]}
                  onChange={e => setForm(prev => ({...prev, [f]: e.target.value}))} />
              </div>
            ))}
          </div>
          <button className="btn btn-success" onClick={handleAdd}>Save Customer</button>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Action</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.phone || "—"}</td>
                  <td className="text-muted">{c.email || "—"}</td>
                  <td className="text-muted">{c.address || "—"}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button></td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} style={{textAlign:"center", padding:32, color:"#9ca3af"}}>No customers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
