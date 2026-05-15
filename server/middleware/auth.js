const Session = require("../models/Session");
const User = require("../models/User");
const { hashSessionToken } = require("../utils/cryptoAuth");

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "bon_delice_sid";

/**
 * Session transport: httpOnly cookie holding a random opaque token.
 * The database stores only SHA-256(token); the raw value never leaves the Set-Cookie header.
 */
async function attachUserFromSession(req, res, next) {
  req.user = null;
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token || typeof token !== "string" || token.length < 32) {
    return next();
  }
  const tokenHash = hashSessionToken(token);
  try {
    const session = await Session.findOne({ tokenHash }).populate("userId");
    if (!session || session.expiresAt <= new Date()) {
      if (session) await Session.deleteOne({ _id: session._id });
      return next();
    }
    const u = session.userId;
    if (!u) {
      await Session.deleteOne({ _id: session._id });
      return next();
    }
    req.user = u;
    req.sessionDoc = session;
  } catch (err) {
    return next(err);
  }
  return next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Нэвтрэх шаардлагатай." });
  }
  return next();
}

function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Нэвтрэх шаардлагатай." });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: "Энэ үйлдлийг хийх эрх байхгүй байна." });
    }
    return next();
  };
}

module.exports = {
  attachUserFromSession,
  requireAuth,
  requireRole,
  COOKIE_NAME,
};
