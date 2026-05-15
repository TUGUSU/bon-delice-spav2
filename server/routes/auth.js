const express = require("express");
const User = require("../models/User");
const Session = require("../models/Session");
const LoginAttempt = require("../models/LoginAttempt");
const {
  validatePasswordPlain,
  hashPassword,
  verifyPassword,
  randomSessionToken,
  hashSessionToken,
} = require("../utils/cryptoAuth");
const { attachUserFromSession, COOKIE_NAME } = require("../middleware/auth");

const router = express.Router();

function sessionTtlMs() {
  const raw = process.env.SESSION_TTL_MS;
  const n = raw ? parseInt(raw, 10) : 1000 * 60 * 60 * 24 * 7;
  return Number.isNaN(n) || n < 60000 ? 1000 * 60 * 60 * 24 * 7 : n;
}

function maxLoginAttempts() {
  const n = parseInt(process.env.LOGIN_MAX_ATTEMPTS || "5", 10);
  return Number.isNaN(n) || n < 1 ? 5 : n;
}

function lockoutMs() {
  const n = parseInt(process.env.LOGIN_LOCKOUT_MS || String(15 * 60 * 1000), 10);
  return Number.isNaN(n) || n < 60000 ? 15 * 60 * 1000 : n;
}

function cookieOptions(expiresAt) {
  const secure = process.env.COOKIE_SECURE === "true";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: expiresAt,
  };
}

function setSessionCookie(res, token, expiresAt) {
  res.cookie(COOKIE_NAME, token, cookieOptions(expiresAt));
}

function clearSessionCookie(res) {
  const secure = process.env.COOKIE_SECURE === "true";
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure, path: "/" });
}

function serializeUser(u) {
  return {
    id: String(u._id),
    username: u.username,
    fullName: u.fullName || "",
    email: u.email || "",
    role: u.role,
  };
}

async function getLoginState(usernameKey) {
  return LoginAttempt.findOneAndUpdate(
    { usernameKey },
    { $setOnInsert: { failedCount: 0, lockUntil: null } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function assertNotLocked(usernameKey) {
  const doc = await getLoginState(usernameKey);
  if (doc.lockUntil && doc.lockUntil > new Date()) {
    const e = new Error("Олон удаа буруу нэвтрэлт. түр хүлээнэ үү.");
    e.status = 429;
    e.lockUntil = doc.lockUntil;
    throw e;
  }
}

async function recordFailedLogin(usernameKey) {
  const max = maxLoginAttempts();
  const lockMs = lockoutMs();
  const doc = await getLoginState(usernameKey);
  const failed = (doc.failedCount || 0) + 1;
  const updates = { failedCount: failed, lastFailedAt: new Date() };
  if (failed >= max) {
    updates.lockUntil = new Date(Date.now() + lockMs);
    updates.failedCount = 0;
  }
  await LoginAttempt.updateOne({ usernameKey }, { $set: updates });
}

async function clearFailedLogins(usernameKey) {
  await LoginAttempt.updateOne(
    { usernameKey },
    { $set: { failedCount: 0, lockUntil: null } },
    { upsert: true }
  );
}

async function createSessionForUser(userId) {
  const token = randomSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + sessionTtlMs());
  await Session.create({ tokenHash, userId, expiresAt });
  return { token, expiresAt };
}

/** 200 + user: null when anonymous — avoids red “failed” requests in DevTools for normal guests */
router.get("/me", (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  return res.json({ user: serializeUser(req.user) });
});

router.post("/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const password = req.body.password;
    const fullName = String(req.body.fullName || "").trim();
    const emailRaw = String(req.body.email || "").trim().toLowerCase();

    if (!username || username.length < 2) {
      return res.status(400).json({ error: "Хэрэглэгчийн нэр 2–64 тэмдэгт байна." });
    }
    if (!/^[a-z0-9._-]+$/i.test(username)) {
      return res
        .status(400)
        .json({ error: "Хэрэглэгчийн нэр зөвхөн үсэг, тоо, . _ - ашиглана." });
    }

    const pwdErr = validatePasswordPlain(password);
    if (pwdErr) {
      return res.status(400).json({ error: pwdErr });
    }

    const passwordHash = await hashPassword(password);
    const userDoc = {
      username: username.toLowerCase(),
      passwordHash,
      role: "customer",
      fullName,
    };
    if (emailRaw) {
      userDoc.email = emailRaw;
    }

    const user = await User.create(userDoc);
    // Do not open a server session here — the client sends users to /login to sign in explicitly.
    return res.status(201).json({ user: serializeUser(user) });
  } catch (err) {
    if (err.code === 11000) {
      const field = err.keyPattern && Object.keys(err.keyPattern)[0];
      if (field === "username") {
        return res.status(409).json({ error: "Энэ хэрэглэгчийн нэр бүртгэлтэй байна." });
      }
      if (field === "email") {
        return res.status(409).json({ error: "Энэ и-мэйл бүртгэлтэй байна." });
      }
      return res.status(409).json({ error: "Өгөгдөл давхцаж байна." });
    }
    if (err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Серверийн алдаа." });
  }
});

router.post("/login", async (req, res) => {
  const usernameKey = String(req.body.username || "").trim().toLowerCase();
  const password = req.body.password;

  try {
    try {
      await assertNotLocked(usernameKey);
    } catch (e) {
      if (e.status === 429) {
        return res.status(429).json({
          error: e.message,
          lockUntil: e.lockUntil ? e.lockUntil.toISOString() : undefined,
        });
      }
      throw e;
    }

    const userQuery = usernameKey.includes("@")
      ? { $or: [{ username: usernameKey }, { email: usernameKey }] }
      : { username: usernameKey };
    const user = await User.findOne(userQuery);
    const valid =
      user &&
      typeof password === "string" &&
      (await verifyPassword(password, user.passwordHash));

    if (!valid) {
      await recordFailedLogin(usernameKey);
      return res
        .status(401)
        .json({ error: "Хэрэглэгчийн нэр эсвэл нууц үг буруу байна." });
    }

    await clearFailedLogins(usernameKey);
    const { token, expiresAt } = await createSessionForUser(user._id);
    setSessionCookie(res, token, expiresAt);
    return res.json({ user: serializeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Серверийн алдаа." });
  }
});

router.post("/logout", attachUserFromSession, async (req, res) => {
  try {
    const token = req.cookies && req.cookies[COOKIE_NAME];
    if (token) {
      const tokenHash = hashSessionToken(token);
      await Session.deleteOne({ tokenHash });
    }
    clearSessionCookie(res);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Серверийн алдаа." });
  }
});

module.exports = router;
