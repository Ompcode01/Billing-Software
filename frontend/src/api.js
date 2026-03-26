// src/api.js
// ─────────────────────────────────────────────────────────────────────────────
// This file centralizes ALL communication with the backend.
// Every function here sends an HTTP request to Express and returns the data.
// Using axios makes it easy — it automatically parses JSON for us.
//
// "proxy": "http://localhost:5000" in package.json means when React calls
// "/api/bills", it gets forwarded to "http://localhost:5000/api/bills"
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

const API = axios.create({ baseURL: "/api" });

// ── BILLS ────────────────────────────────────────────────────────────────────
export const getBills      = ()       => API.get("/bills").then(r => r.data);
export const getBill       = (id)     => API.get(`/bills/${id}`).then(r => r.data);
export const createBill    = (data)   => API.post("/bills", data).then(r => r.data);
export const deleteBill    = (id)     => API.delete(`/bills/${id}`).then(r => r.data);

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
export const getProducts   = ()       => API.get("/products").then(r => r.data);
export const createProduct = (data)   => API.post("/products", data).then(r => r.data);
export const updateProduct = (id, d)  => API.put(`/products/${id}`, d).then(r => r.data);
export const deleteProduct = (id)     => API.delete(`/products/${id}`).then(r => r.data);

// ── CUSTOMERS ────────────────────────────────────────────────────────────────
export const getCustomers   = ()     => API.get("/customers").then(r => r.data);
export const createCustomer = (data) => API.post("/customers", data).then(r => r.data);
export const deleteCustomer = (id)   => API.delete(`/customers/${id}`).then(r => r.data);

// ── SETTINGS ─────────────────────────────────────────────────────────────────
export const getSettings    = ()     => API.get("/settings").then(r => r.data);
export const updateSettings = (data) => API.put("/settings", data).then(r => r.data);
