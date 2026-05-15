require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDb } = require("./db");
const User = require("./models/User");
const { hashPassword } = require("./utils/cryptoAuth");
const { attachUserFromSession } = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const ordersRoutes = require("./routes/orders");
const usersRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

const originList = (
  process.env.CORS_ORIGIN ||
  "http://localhost:3000,http://127.0.0.1:3000,https://bon-delice.netlify.app"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: originList,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(attachUserFromSession);

app.use("/api/auth", authRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

async function maybeBootstrapAdmin() {
  const u = process.env.BOOTSTRAP_ADMIN_USERNAME;
  const p = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!u || !p) return;
  const username = String(u).trim().toLowerCase();
  const exists = await User.findOne({ username });
  if (exists) return;
  try {
    const passwordHash = await hashPassword(p);
    await User.create({
      username,
      passwordHash,
      role: "admin",
      fullName: "Administrator",
    });
    console.log(`Bootstrap admin created: ${username}`);
  } catch (e) {
    console.error("Bootstrap admin failed:", e.message);
  }
}

connectDb()
  .then(() => maybeBootstrapAdmin())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
