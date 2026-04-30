import React from "react";

/**
 * Toast notification container
 * CS142: functional component, renders list from props
 */
const ICONS = { success: "✅", error: "❌", info: "ℹ️" };

function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{ICONS[t.type] || "✅"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export default Toast;
