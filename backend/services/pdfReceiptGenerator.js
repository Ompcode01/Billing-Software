// services/pdfReceiptGenerator.js
// Generates PDF receipts for bills

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class PDFReceiptGenerator {
  constructor() {
    this.uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // ── Generate PDF receipt for a bill ────────────────────────────────────
  async generateReceipt(bill, settings = {}) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `receipt_${bill.id}_${Date.now()}.pdf`;
        const filePath = path.join(this.uploadsDir, fileName);

        const doc = new PDFDocument({
          size: "A4",
          margin: 40,
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // ── Header ──────────────────────────────────────────────────────
        const shopName = settings.shopName || "My Shop";
        doc.fontSize(24).font("Helvetica-Bold").text(shopName, { align: "center" });

        if (settings.address) {
          doc.fontSize(10).font("Helvetica").text(settings.address, { align: "center" });
        }

        if (settings.phone) {
          doc.fontSize(10).text(`Phone: ${settings.phone}`, { align: "center" });
        }

        if (settings.gstin) {
          doc.fontSize(9).text(`GSTIN: ${settings.gstin}`, { align: "center" });
        }

        doc.moveTo(40, doc.y + 10).lineTo(555, doc.y + 10).stroke();
        doc.moveDown(1);

        // ── Invoice Details ─────────────────────────────────────────────
        doc.fontSize(11).font("Helvetica-Bold").text("INVOICE", { underline: true });
        doc.fontSize(9).font("Helvetica");

        const detailsStartY = doc.y;
        doc.text(`Invoice No: ${bill.billNumber}`);
        doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString("en-IN")}`);
        doc.text(`Customer: ${bill.customerName || "N/A"}`);
        doc.text(`Phone: ${bill.customerPhone || "N/A"}`);

        doc.moveDown(0.5);

        // ── Items Table ─────────────────────────────────────────────────
        const tableTop = doc.y + 10;
        const col1 = 50;   // Item Name
        const col2 = 300;  // Qty
        const col3 = 380;  // Price
        const col4 = 470;  // Total

        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Item", col1, tableTop);
        doc.text("Qty", col2, tableTop);
        doc.text("Price", col3, tableTop);
        doc.text("Total", col4, tableTop);

        doc.moveTo(40, tableTop + 15).lineTo(555, tableTop + 15).stroke();

        let tableY = tableTop + 25;
        doc.fontSize(9).font("Helvetica");

        bill.items.forEach((item) => {
          const itemTotal = (item.qty * item.price).toFixed(2);
          doc.text(item.name, col1, tableY);
          doc.text(`${item.qty} ${item.unit}`, col2, tableY);
          doc.text(`₹${item.price.toFixed(2)}`, col3, tableY);
          doc.text(`₹${itemTotal}`, col4, tableY);

          if (item.taxRate && item.taxRate > 0) {
            const taxAmount = ((item.qty * item.price) * item.taxRate) / 100;
            doc.fontSize(8).text(
              `(Tax ${item.taxRate}%: ₹${taxAmount.toFixed(2)})`,
              col1,
              tableY + 15
            );
            tableY += 30;
          } else {
            tableY += 20;
          }
        });

        doc.moveTo(40, tableY).lineTo(555, tableY).stroke();
        tableY += 15;

        // ── Totals ──────────────────────────────────────────────────────
        doc.fontSize(10).font("Helvetica");
        doc.text(`Subtotal:`, col2, tableY);
        doc.text(`₹${bill.subtotal.toFixed(2)}`, col4, tableY, { align: "left" });

        tableY += 20;
        doc.text(`Tax (GST):`, col2, tableY);
        doc.text(`₹${bill.taxAmount.toFixed(2)}`, col4, tableY, { align: "left" });

        if (bill.discountAmount > 0) {
          tableY += 20;
          doc.text(`Discount:`, col2, tableY);
          doc.text(`-₹${bill.discountAmount.toFixed(2)}`, col4, tableY, { align: "left" });
        }

        tableY += 25;
        doc.fontSize(12).font("Helvetica-Bold");
        doc.text(`Grand Total:`, col2, tableY);
        doc.text(`₹${bill.grandTotal.toFixed(2)}`, col4, tableY, { align: "left" });

        // ── Footer ──────────────────────────────────────────────────────
        if (bill.notes) {
          doc.moveDown(2);
          doc.fontSize(9).font("Helvetica");
          doc.text(`Notes: ${bill.notes}`);
        }

        doc.moveDown(3);
        doc.fontSize(9).text("Thank you for your business!", { align: "center" });
        doc.fontSize(8).text(
          `Generated on ${new Date().toLocaleString("en-IN")}`,
          { align: "center" }
        );

        doc.end();

        stream.on("finish", () => {
          resolve(filePath);
        });

        stream.on("error", (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // ── Clean up old PDFs (optional) ────────────────────────────────────
  cleanupOldFiles(maxAgeHours = 24) {
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    const now = Date.now();

    fs.readdirSync(this.uploadsDir).forEach((file) => {
      const filePath = path.join(this.uploadsDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    });
  }
}

module.exports = new PDFReceiptGenerator();
