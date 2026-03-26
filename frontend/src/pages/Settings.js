import React, { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../api";

export default function Settings() {
  const [form, setForm]     = useState({ 
    shopName: "", 
    gstin: "", 
    address: "", 
    phone: "",
    whatsappPhoneNumberId: "",
    whatsappBusinessAccountId: "",
    whatsappAccessToken: ""
  });
  const [saved, setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWhatsAppHelp, setShowWhatsAppHelp] = useState(false);

  useEffect(() => {
    getSettings().then(s => { setForm(s); setLoading(false); });
  }, []);

  const handleSave = async () => {
    await updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="text-muted">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Shop Settings</h1>
        <p>Configure your business information and WhatsApp integration</p>
      </div>

      {/* Shop Settings */}
      <div className="card" style={{maxWidth:560, marginBottom: 24}}>
        <h3 style={{marginBottom: 16, fontSize: 18, fontWeight: 700}}>📋 Business Information</h3>
        <p style={{color: "#666", fontSize: 13, marginBottom: 16}}>This info will appear on all your printed bills</p>
        {[
          ["shopName","Shop / Business Name","My Kirana Store"],
          ["gstin","GSTIN Number","22AAAAA0000A1Z5"],
          ["phone","Phone Number","9876543210"],
          ["address","Shop Address","123, Main Street, Pune, Maharashtra"],
        ].map(([field, label, placeholder]) => (
          <div className="form-group" key={field}>
            <label>{label}</label>
            <input className="form-control" placeholder={placeholder}
              value={form[field] || ""}
              onChange={e => setForm(p => ({...p, [field]: e.target.value}))}
            />
          </div>
        ))}
      </div>

      {/* WhatsApp Configuration */}
      <div className="card" style={{maxWidth:560, marginBottom: 24}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16}}>
          <h3 style={{fontSize: 18, fontWeight: 700, margin: 0}}>💬 WhatsApp Integration</h3>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => setShowWhatsAppHelp(!showWhatsAppHelp)}
            style={{padding: "4px 12px", fontSize: 12}}
          >
            {showWhatsAppHelp ? "Hide" : "Show"} Help
          </button>
        </div>

        {showWhatsAppHelp && (
          <div style={{
            background: "#e3f2fd",
            border: "1px solid #90caf9",
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            fontSize: 12,
            color: "#1565c0"
          }}>
            <strong>📖 How to get WhatsApp API Credentials:</strong>
            <ol style={{marginTop: 8, marginBottom: 0, paddingLeft: 20}}>
              <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">Facebook Developers</a></li>
              <li>Create a Meta Business Account (if you don't have one)</li>
              <li>Create an App and select WhatsApp as product</li>
              <li>Go to "WhatsApp &gt; Getting Started" to find your credentials</li>
              <li>Copy Phone Number ID, Business Account ID, and Access Token below</li>
            </ol>
          </div>
        )}

        <div className="form-group">
          <label>WhatsApp Phone Number ID *</label>
          <input 
            className="form-control" 
            placeholder="e.g., 1234567890123456"
            value={form.whatsappPhoneNumberId || ""}
            onChange={e => setForm(p => ({...p, whatsappPhoneNumberId: e.target.value}))}
          />
          <small style={{color: "#666", display: "block", marginTop: 4}}>Find this in your WhatsApp Business Account settings</small>
        </div>

        <div className="form-group">
          <label>WhatsApp Business Account ID</label>
          <input 
            className="form-control" 
            placeholder="e.g., 123456789"
            value={form.whatsappBusinessAccountId || ""}
            onChange={e => setForm(p => ({...p, whatsappBusinessAccountId: e.target.value}))}
          />
          <small style={{color: "#666", display: "block", marginTop: 4}}>Optional - mainly for advanced features</small>
        </div>

        <div className="form-group">
          <label>WhatsApp Access Token *</label>
          <input 
            className="form-control" 
            type="password"
            placeholder="Paste your access token here"
            value={form.whatsappAccessToken || ""}
            onChange={e => setForm(p => ({...p, whatsappAccessToken: e.target.value}))}
          />
          <small style={{color: "#666", display: "block", marginTop: 4}}>Keep this safe - never share your access token</small>
        </div>

        {form.whatsappPhoneNumberId && form.whatsappAccessToken && (
          <div style={{
            background: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: 6,
            padding: 12,
            color: "#155724",
            fontSize: 13
          }}>
            ✅ WhatsApp integration is configured! You can now send receipts via WhatsApp.
          </div>
        )}
      </div>

      {/* Save Button */}
      <button className="btn btn-primary btn-lg" onClick={handleSave}>
        {saved ? "✅ All Settings Saved!" : "Save All Settings"}
      </button>
    </div>
  );
}
