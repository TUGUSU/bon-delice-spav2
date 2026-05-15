const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function validatePasswordPlain(plain) {
  if (typeof plain !== "string" || plain.length < 8) {
    return "Нууц үг хамгийн багадаа 8 тэмдэгт, том жижиг үсэг, тоо, тусгай тэмдэгт агуулна.";
  }
  if (!PASSWORD_RULE.test(plain)) {
    return "Нууц үг: дор хаяж 8 тэмдэгт, том үсэг, жижиг үсэг, тоо, тусгай тэмдэгт шаардлагатай.";
  }
  return null;
}

function applyPepper(plain) {
  const pepper = process.env.PASSWORD_PEPPER || "";
  return `${plain}${pepper}`;
}

function bcryptCost() {
  const raw = process.env.BCRYPT_ROUNDS;
  const n = raw ? parseInt(raw, 10) : 12;
  if (Number.isNaN(n) || n < 10 || n > 15) return 12;
  return n;
}

async function hashPassword(plain) {
  const err = validatePasswordPlain(plain);
  if (err) {
    const e = new Error(err);
    e.status = 400;
    throw e;
  }
  const material = applyPepper(plain);
  return bcrypt.hash(material, bcryptCost());
}

async function verifyPassword(plain, passwordHash) {
  const material = applyPepper(plain);
  return bcrypt.compare(material, passwordHash);
}

function randomSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashSessionToken(token) {
  return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

module.exports = {
  validatePasswordPlain,
  hashPassword,
  verifyPassword,
  randomSessionToken,
  hashSessionToken,
};
