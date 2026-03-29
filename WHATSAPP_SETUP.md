# WhatsApp Receipt Integration Setup Guide

This guide will help you set up WhatsApp integration to send receipts directly to your customers' phones.

## 📋 Prerequisites

You'll need:
- A Meta Business Account (free to create)
- A WhatsApp Business Account
- A phone number to verify with WhatsApp

## 🚀 Step 1: Create Meta Business Account

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click "Get Started" and create a new account
3. Create a Meta Business Account (or use existing one)
4. Confirm your email address

## 🔧 Step 2: Create WhatsApp App

1. In Facebook Developers, go to "Apps" → "Create App"
2. Choose "Business" as app type
3. Fill in app details:
   - **App Name**: "Vyapar Billing" (or any name)
   - **App Contact Email**: Your email
   - **App Purpose**: Business management
4. Click "Create App"

## 📱 Step 3: Add WhatsApp to Your App

1. In your app dashboard, click "Add Product"
2. Find **WhatsApp** and click "Set Up"
3. Click "Start Setup" next to WhatsApp

## 🔑 Step 4: Get Your Credentials

### 4.1 Get Phone Number ID
1. In WhatsApp Business setup, go to **"Getting Started"**
2. Under "Manage your business accounts", click **"Create a new business account"** (or select existing)
3. Add a phone number to verify
4. After verification, you'll see your **Phone Number ID** - copy this

### 4.2 Get Business Account ID
1. In the same WhatsApp section, find your **Business Account ID**
2. It's displayed near the Phone Number ID
3. Copy this as well

### 4.3 Get Access Token
1. Go to **Settings** → **User Token Settings** or **App Settings**
2. Look for "Temporary access token" or generate a new permanent token
3. Generate a **System User Access Token**:
   - Go to Settings → Roles → System Users
   - Create new System User or select existing
   - Generate token for WhatsApp permission
4. Copy the token (you won't be able to see it again!)

## 💾 Step 5: Configure in Vyapar App

### Via Settings Page (Recommended)

1. Open your Vyapar app in browser
2. Go to **Settings** page
3. Scroll to **"WhatsApp Integration"** section
4. Enter your credentials:
   - **WhatsApp Phone Number ID**: Paste your Phone Number ID
   - **WhatsApp Business Account ID**: Paste your Business Account ID
   - **WhatsApp Access Token**: Paste your access token
5. Click **"Save All Settings"**
6. You should see ✅ "WhatsApp integration is configured!"

### Via Environment Variables (Alternative)

1. In your backend folder, create/edit `.env` file:
```bash
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
```

2. Restart your backend server

## 📲 Step 6: Test WhatsApp Integration

1. Create a new bill in Vyapar
2. Make sure to enter the customer's **phone number** (10 digits, e.g., 9876543210)
3. Click **"Save Bill"**
4. In the bill detail page, click **"💬 Send via WhatsApp"** button
5. A success message should appear showing the phone number it was sent to
6. The customer will receive the receipt on WhatsApp!

## ⚡ Features

### What Gets Sent
- **Text Message**: Formatted receipt with:
  - Invoice number
  - Date
  - Customer name
  - Itemized list with quantities and prices
  - Tax details
  - Total amount
  - Shop name and notes

- **PDF Attachment** (Optional): A printable PDF receipt stored on your server

### Message Format
The WhatsApp message includes:
```
*Shop Name - Receipt*
━━━━━━━━━━━━━━━━━━
📄 Invoice: INV-0001
📅 Date: 26/Mar/2026
👤 Customer: John Doe

*Items:*
Product Name
Qty: 2 x ₹100.00 = ₹200.00

...

━━━━━━━━━━━━━━━━━━
Subtotal: ₹200.00
Tax (GST): ₹36.00
Discount: -₹10.00
━━━━━━━━━━━━━━━━━━
*Total: ₹226.00*
━━━━━━━━━━━━━━━━━━

Thank you for shopping!
```

## 🔒 Security Best Practices

1. **Never share your Access Token** - treat it like a password
2. **Use Environment Variables** for local development (don't commit `.env` to git)
3. **Rotate tokens regularly** - generate a new one every few months
4. **Disable old tokens** when you create new ones
5. **Use HTTPS** - ensure your app runs over secure connection in production

## ❌ Troubleshooting

### "WhatsApp is not configured"
- ✅ Make sure you've added credentials in Settings page, OR
- ✅ Check that `.env` file has correct credentials, OR
- ✅ Make sure you've restarted the backend server after adding `.env` file

### "Failed to send WhatsApp message"
- ✅ Verify phone number format (should be 10 digits for India)
- ✅ Check if access token is still valid (may need to regenerate)
- ✅ Ensure WhatsApp Business Account is active and verified
- ✅ Check network connectivity
- ✅ Look at backend console for detailed error messages

### "Customer phone number is required"
- ✅ When creating a bill, make sure to enter the customer's phone number
- ✅ Don't leave the phone field empty

### Phone number not receiving message
- ✅ Verify the phone number is correct
- ✅ Make sure phone has WhatsApp installed
- ✅ Check WhatsApp Business Account phone verification is complete
- ✅ Try sending to a different number to test

## 📞 Rate Limits

- You can send unlimited receipts (no daily limit)
- However, Meta imposes quality rating system:
  - Keep message rejection rate low
  - Respond promptly to customer messages
  - Use approved message templates (if required by Meta)

## 🔄 Next Steps

1. Once configured, every bill with a phone number can send receipts via WhatsApp
2. Customers receive receipts instantly
3. You can resend to the same number anytime
4. PDFs are generated server-side and can be downloaded/emailed

## 📚 Additional Resources

- [Meta WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [WhatsApp Business Platform](https://www.whatsapp.com/business/)
- [Phone Number ID Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers)

---

**Need Help?** Check the troubleshooting section above or review backend logs for detailed error messages.
