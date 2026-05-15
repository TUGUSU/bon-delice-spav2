const mongoose = require("mongoose");

/**
 * Persists login throttling per username (normalized).
 * Survives server restarts; tradeoff: no IP-level throttling unless extended.
 */
const loginAttemptSchema = new mongoose.Schema(
  {
    usernameKey: { type: String, required: true, unique: true, index: true },
    failedCount: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastFailedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.LoginAttempt || mongoose.model("LoginAttempt", loginAttemptSchema);
