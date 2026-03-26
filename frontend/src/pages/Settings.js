// src/pages/Settings.js
// Shop owner configures their business info here — it appears on all printed bills.

import React, { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../api";

export default function Settings() {
  const [form, setForm]     = useState({ shopName: "", gstin: "", address: "", phone: "" });
  const [saved, setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);

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
        <p>This info will appear on all your printed bills</p>
      </div>
      <div className="card" style={{maxWidth:560}}>
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
        <button className="btn btn-primary btn-lg" onClick={handleSave}>
          {saved ? "✅ Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
