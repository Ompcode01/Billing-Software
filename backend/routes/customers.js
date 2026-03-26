// routes/customers.js
const express = require("express");
const router  = express.Router();
const { v4: uuidv4 } = require("uuid");

router.get("/", (req, res) => {
  const db = req.readDB();
  res.json(db.customers);
});

router.post("/", (req, res) => {
  const db = req.readDB();
  const { name, phone, email = "", address = "" } = req.body;
  if (!name) return res.status(400).json({ error: "Customer name required" });

  const customer = { id: uuidv4(), name, phone, email, address };
  db.customers.push(customer);
  req.writeDB(db);
  res.status(201).json(customer);
});

router.delete("/:id", (req, res) => {
  const db = req.readDB();
  db.customers = db.customers.filter((c) => c.id !== req.params.id);
  req.writeDB(db);
  res.json({ message: "Deleted" });
});

module.exports = router;
