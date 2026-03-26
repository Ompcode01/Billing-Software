// server.js — Main Entry Point for Vyapar Backend
// This file starts an Express web server that handles all API requests from the frontend.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const billRoutes = require("./routes/bills");
const productRoutes = require("./routes/products");
const customerRoutes = require("./routes/customers");

const app = express();
const PORT = 5000;

// ── MIDDLEWARE ──────────────────────────────────────────────────────────────
// cors()      → Allows the React frontend (port 3000) to talk to this server (port 5000)
// express.json() → Parses incoming JSON request bodies automatically
app.use(cors());
app.use(express.json());

// ── DATA STORE SETUP ────────────────────────────────────────────────────────
// We use a simple JSON file as a database so you don't need MongoDB or MySQL.
// In production you would replace this with a real database.
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Initialize the JSON "database" with empty arrays if it doesn't exist yet
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify({ 
      bills: [], 
      products: [], 
      customers: [], 
      settings: { 
        shopName: "My Shop", 
        gstin: "", 
        address: "", 
        phone: "",
        whatsappPhoneNumberId: "",
        whatsappBusinessAccountId: "",
        whatsappAccessToken: ""
      } 
    }, null, 2)
  );
}

// Attach helper functions to every request so routes can read/write data
app.use((req, res, next) => {
  req.readDB  = () => JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  req.writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  next();
});

// ── ROUTES ──────────────────────────────────────────────────────────────────
// Each route file handles one "resource" (bills, products, customers)
app.use("/api/bills",     billRoutes);
app.use("/api/products",  productRoutes);
app.use("/api/customers", customerRoutes);

// Settings endpoints (simple, so kept here)
app.get("/api/settings", (req, res) => {
  const db = req.readDB();
  res.json(db.settings);
});

app.put("/api/settings", (req, res) => {
  const db = req.readDB();
  db.settings = { ...db.settings, ...req.body };
  req.writeDB(db);
  res.json(db.settings);
});

// ── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Vyapar Backend running at http://localhost:${PORT}`);
});
