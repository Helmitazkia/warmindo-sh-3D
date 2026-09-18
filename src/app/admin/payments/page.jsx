"use client";

import { useState } from "react";
import MasterPaymentsSection from "@/components/admin/MasterPaymentsSection";
import { CheckSquare } from "lucide-react";

export default function MasterPaymentsPage() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            borderRadius: 8,
            background: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
            border: `1px solid ${toast.type === "success" ? "#34d399" : "#fca5a5"}`,
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
            color: toast.type === "success" ? "#065f46" : "#991b1b",
            minWidth: 320,
          }}
        >
          {toast.type === "success" ? (
            <CheckSquare size={20} style={{ color: "#10b981", flexShrink: 0 }} />
          ) : (
            <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: "#ef4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>!</div>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>
              {toast.type === "success" ? "Berhasil" : "Terjadi Kesalahan"}
            </p>
            <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.9 }}>{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.6 }}>✕</button>
        </div>
      )}

      {/* Main Section */}
      <MasterPaymentsSection showToast={showToast} />
    </div>
  );
}
