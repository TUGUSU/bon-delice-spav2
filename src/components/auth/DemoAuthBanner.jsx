import React from "react";
import { DEMO_CREDENTIALS } from "../../auth/demoAuth";

function DemoAuthBanner({ compact = false }) {
  if (compact) {
    return (
      <p className="demo-auth-hint" role="status">
        Demo горим — өгөгдөл зөвхөн энэ төхөөрөмжийн localStorage-д хадгалагдана.
      </p>
    );
  }

  return (
    <div className="demo-auth-banner" role="status">
      <p className="demo-auth-banner-title">Demo authenticator (API шаардлагагүй)</p>
      <p className="demo-auth-banner-text">Netlify дээр шууд турших бэлэн хэрэглэгчид:</p>
      <ul className="demo-auth-creds">
        {DEMO_CREDENTIALS.map((c) => (
          <li key={c.username}>
            <strong>{c.username}</strong> / <code>{c.password}</code>
            <span className="demo-auth-role"> — {c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DemoAuthBanner;
