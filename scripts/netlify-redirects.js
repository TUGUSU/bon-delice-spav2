/**
 * Writes public/_redirects before Netlify build.
 * Set NETLIFY_API_URL to your deployed Express API (e.g. https://bon-delice-api.onrender.com)
 * so https://bon-delice.netlify.app/api/* is proxied to the real backend.
 */
const fs = require("fs");
const path = require("path");

const apiBase = (process.env.NETLIFY_API_URL || "").trim().replace(/\/$/, "");
const lines = [];

if (apiBase) {
  lines.push(`/api/*  ${apiBase}/api/:splat  200`);
  console.log(`[netlify] /api/* -> ${apiBase}/api/:splat`);
} else {
  console.warn(
    "[netlify] NETLIFY_API_URL is not set — /api/auth/* will return 404 on Netlify. Deploy the Express API and set this env var in Site settings."
  );
}

lines.push("/*    /index.html   200");

const outPath = path.join(__dirname, "..", "public", "_redirects");
fs.writeFileSync(outPath, `${lines.join("\n")}\n`);
console.log(`[netlify] wrote ${outPath}`);
