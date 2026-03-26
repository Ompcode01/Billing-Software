// services/whatsappService.js
// Handles WhatsApp Cloud API integration for sending messages and media

const axios = require("axios");

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || "https://graph.instagram.com/v18.0";
  }

  // ── Set credentials (can be called with settings from DB) ───────────────
  setCredentials(phoneNumberId, accessToken, businessAccountId = null) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
    this.businessAccountId = businessAccountId;
  }

  // ── Initialize from environment variables ──────────────────────────────
  initFromEnv() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  }

  // ── Validate configuration ──────────────────────────────────────────────
  isConfigured() {
    return this.phoneNumberId && this.accessToken;
  }

  // ── Send text message ──────────────────────────────────────────────────
  async sendMessage(recipientPhoneNumber, messageText) {
    if (!this.isConfigured()) {
      throw new Error("WhatsApp API is not configured. Please set environment variables.");
    }

    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      const response = await axios.post(
        url,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipientPhoneNumber,
          type: "text",
          text: {
            body: messageText,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        status: response.data.messages[0].message_status,
      };
    } catch (error) {
      console.error("WhatsApp send error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.error?.message || "Failed to send WhatsApp message"
      );
    }
  }

  // ── Send formatted receipt message ──────────────────────────────────────
  async sendReceiptMessage(recipientPhoneNumber, billDetails) {
    const message = this.formatReceiptMessage(billDetails);
    return this.sendMessage(recipientPhoneNumber, message);
  }

  // ── Format bill data into nice receipt text ────────────────────────────
  formatReceiptMessage(bill) {
    const settings = bill.settings || {};
    const shopName = settings.shopName || "My Shop";
    
    const itemsList = bill.items
      .map(
        (item) =>
          `${item.name}\nQty: ${item.qty} x ₹${item.price.toFixed(2)} = ₹${(
            item.qty * item.price
          ).toFixed(2)}`
      )
      .join("\n\n");

    const receiptText = `
*${shopName} - Receipt*
━━━━━━━━━━━━━━━━━━━━
📄 Invoice: ${bill.billNumber}
📅 Date: ${new Date(bill.createdAt).toLocaleDateString("en-IN")}
👤 Customer: ${bill.customerName || "Guest"}

*Items:*
${itemsList}

━━━━━━━━━━━━━━━━━━━━
Subtotal: ₹${bill.subtotal.toFixed(2)}
Tax (GST): ₹${bill.taxAmount.toFixed(2)}
Discount: -₹${bill.discountAmount.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━
*Total: ₹${bill.grandTotal.toFixed(2)}*
━━━━━━━━━━━━━━━━━━━━

${bill.notes ? `📝 Notes: ${bill.notes}` : ""}

Thank you for shopping!
    `.trim();

    return receiptText;
  }
}

module.exports = new WhatsAppService();
