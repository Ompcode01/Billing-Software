// routes/bills.js
// Handles all bill-related API endpoints: create, read, update, delete

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const whatsappService = require("../services/whatsappService");
const pdfGenerator = require("../services/pdfReceiptGenerator");

// ── GET /api/bills ─── Fetch all bills (transaction history)
router.get("/", (req, res) => {
  const db = req.readDB();
  // Sort newest first
  const sorted = [...db.bills].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});

// ── GET /api/bills/:id ─── Fetch a single bill by its ID
router.get("/:id", (req, res) => {
  const db = req.readDB();
  const bill = db.bills.find((b) => b.id === req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });
  res.json(bill);
});

// ── POST /api/bills ─── Create a new bill
router.post("/", (req, res) => {
  const db = req.readDB();

  // The frontend sends: customerName, customerPhone, items[], discount, notes
  const { customerName, customerPhone, items, discount = 0, notes = "" } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Bill must have at least one item" });
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxAmount = items.reduce((sum, item) => {
    const itemTotal = item.price * item.qty;
    return sum + (itemTotal * (item.taxRate || 0)) / 100;
  }, 0);
  const discountAmount = (subtotal * discount) / 100;
  const grandTotal = subtotal + taxAmount - discountAmount;

  // Auto-generate bill number (e.g. INV-0042)
  const billNumber = `INV-${String(db.bills.length + 1).padStart(4, "0")}`;

  const newBill = {
    id: uuidv4(),            // Unique ID (e.g. "a3f8c2...")
    billNumber,              // Human-readable number
    customerName,
    customerPhone,
    items,                   // Array of { name, qty, price, taxRate, unit }
    subtotal,
    taxAmount,
    discount,
    discountAmount,
    grandTotal,
    notes,
    status: "paid",          // Default status
    createdAt: new Date().toISOString(),
  };

  db.bills.push(newBill);
  req.writeDB(db);

  res.status(201).json(newBill);
});

// ── DELETE /api/bills/:id ─── Delete a bill
router.delete("/:id", (req, res) => {
  const db = req.readDB();
  const index = db.bills.findIndex((b) => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Bill not found" });
  db.bills.splice(index, 1);
  req.writeDB(db);
  res.json({ message: "Bill deleted" });
});

// ── POST /api/bills/:id/send-whatsapp ─── Send receipt via WhatsApp
router.post("/:id/send-whatsapp", async (req, res) => {
  try {
    const db = req.readDB();
    const bill = db.bills.find((b) => b.id === req.params.id);
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    // Get settings which contain WhatsApp credentials
    const settings = db.settings || {};

    // Set WhatsApp credentials from settings or environment
    if (settings.whatsappPhoneNumberId && settings.whatsappAccessToken) {
      whatsappService.setCredentials(
        settings.whatsappPhoneNumberId,
        settings.whatsappAccessToken,
        settings.whatsappBusinessAccountId
      );
    } else {
      whatsappService.initFromEnv();
    }

    // Check if WhatsApp is configured
    if (!whatsappService.isConfigured()) {
      return res.status(400).json({
        error: "WhatsApp is not configured. Please add API credentials in settings.",
        code: "WHATSAPP_NOT_CONFIGURED",
      });
    }

    // Validate phone number
    if (!bill.customerPhone) {
      return res.status(400).json({
        error: "Customer phone number is required to send via WhatsApp",
        code: "PHONE_NUMBER_MISSING",
      });
    }

    // Format phone number (add country code if not present - assuming India)
    let phoneNumber = bill.customerPhone.replace(/\D/g, "");
    if (!phoneNumber.startsWith("91")) {
      phoneNumber = "91" + phoneNumber;
    }

    // Send text receipt message
    try {
      const billWithSettings = { ...bill, settings };
      await whatsappService.sendReceiptMessage(phoneNumber, billWithSettings);

      // Generate PDF receipt
      const pdfPath = await pdfGenerator.generateReceipt(bill, settings);

      // Update bill with WhatsApp delivery status
      const billIndex = db.bills.findIndex((b) => b.id === req.params.id);
      if (billIndex !== -1) {
        db.bills[billIndex].whatsappSentAt = new Date().toISOString();
        req.writeDB(db);
      }

      res.json({
        success: true,
        message: "Receipt sent via WhatsApp successfully",
        pdfPath: pdfPath,
        phoneNumber: phoneNumber.replace(/(\d{2})(\d{10})/, "+$1 $2"), // Format for display
      });
    } catch (whatsappError) {
      res.status(400).json({
        success: false,
        error: whatsappError.message,
        code: "WHATSAPP_SEND_FAILED",
      });
    }
  } catch (error) {
    console.error("Send WhatsApp error:", error);
    res.status(500).json({
      error: "Failed to send receipt",
      message: error.message,
    });
  }
});

module.exports = router;
