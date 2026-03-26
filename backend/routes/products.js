// routes/products.js
// Manage your product/inventory catalogue

const express = require("express");
const router  = express.Router();
const { v4: uuidv4 } = require("uuid");

// GET all products
router.get("/", (req, res) => {
  const db = req.readDB();
  res.json(db.products);
});

// POST — add a new product to catalogue
router.post("/", (req, res) => {
  const db = req.readDB();
  const { name, price, taxRate = 18, unit = "pcs", stock = 0 } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Name and price required" });

  const product = { id: uuidv4(), name, price: parseFloat(price), taxRate, unit, stock };
  db.products.push(product);
  req.writeDB(db);
  res.status(201).json(product);
});

// PUT — update a product
router.put("/:id", (req, res) => {
  const db = req.readDB();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  db.products[idx] = { ...db.products[idx], ...req.body };
  req.writeDB(db);
  res.json(db.products[idx]);
});

// DELETE — remove a product
router.delete("/:id", (req, res) => {
  const db = req.readDB();
  db.products = db.products.filter((p) => p.id !== req.params.id);
  req.writeDB(db);
  res.json({ message: "Product deleted" });
});

module.exports = router;
