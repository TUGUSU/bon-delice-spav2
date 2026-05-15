/**
 * Browser-only demo authenticator (localStorage). For Netlify / static deploy without API.
 * Not for production secrets — passwords are stored in plain text locally.
 */

const USERS_KEY = "bon_delice_demo_users";
const SESSION_KEY = "bon_delice_demo_session";
const ORDERS_KEY = "bon_delice_demo_orders";

export const DEMO_CREDENTIALS = [
  { username: "demo", password: "Demo123!", label: "Хэрэглэгч (customer)" },
  { username: "admin", password: "Admin123!", label: "Админ (admin)" },
];

const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const BUILTIN_USERS = [
  {
    id: "demo-user-1",
    username: "demo",
    password: "Demo123!",
    fullName: "Demo Хэрэглэгч",
    email: "demo@example.com",
    role: "customer",
  },
  {
    id: "demo-admin-1",
    username: "admin",
    password: "Admin123!",
    fullName: "Demo Админ",
    email: "admin@example.com",
    role: "admin",
  },
];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedUsers() {
  const existing = readJson(USERS_KEY, null);
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing;
  }
  writeJson(USERS_KEY, BUILTIN_USERS);
  return BUILTIN_USERS;
}

function getUsers() {
  return seedUsers();
}

function saveUsers(users) {
  writeJson(USERS_KEY, users);
}

export function validatePasswordDemo(plain) {
  if (typeof plain !== "string" || plain.length < 8) {
    return "Нууц үг хамгийн багадаа 8 тэмдэгт, том жижиг үсэг, тоо, тусгай тэмдэгт агуулна.";
  }
  if (!PASSWORD_RULE.test(plain)) {
    return "Нууц үг: дор хаяж 8 тэмдэгт, том үсэг, жижиг үсэг, тоо, тусгай тэмдэгт шаардлагатай.";
  }
  return null;
}

function serializeUser(u) {
  return {
    id: u.id,
    username: u.username,
    fullName: u.fullName || "",
    email: u.email || "",
    role: u.role || "customer",
  };
}

function findUser(usernameKey) {
  const users = getUsers();
  return users.find((u) => u.username === usernameKey);
}

export function demoGetSessionUser() {
  const sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) return null;
  const user = getUsers().find((u) => u.id === sessionId);
  return user ? serializeUser(user) : null;
}

export function demoLogin({ username, password }) {
  const key = String(username || "").trim().toLowerCase();
  if (!key) {
    return { ok: false, message: "Хэрэглэгчийн нэрээ оруулна уу." };
  }
  const user = findUser(key);
  if (!user || user.password !== password) {
    return { ok: false, message: "Хэрэглэгчийн нэр эсвэл нууц үг буруу байна." };
  }
  localStorage.setItem(SESSION_KEY, user.id);
  return { ok: true, user: serializeUser(user) };
}

export function demoRegister({ username, fullName, email, password }) {
  const u = String(username || "").trim().toLowerCase();
  if (!u || u.length < 2) {
    return { ok: false, message: "Хэрэглэгчийн нэр 2+ тэмдэгт байна." };
  }
  if (!/^[a-z0-9._-]+$/i.test(u)) {
    return { ok: false, message: "Хэрэглэгчийн нэр зөвхөн үсэг, тоо, . _ - ашиглана." };
  }
  const pwdErr = validatePasswordDemo(password);
  if (pwdErr) {
    return { ok: false, message: pwdErr };
  }
  const users = getUsers();
  if (users.some((x) => x.username === u)) {
    return { ok: false, message: "Энэ хэрэглэгчийн нэр бүртгэлтэй байна.", status: 409 };
  }
  const emailRaw = String(email || "").trim().toLowerCase();
  if (emailRaw && users.some((x) => x.email === emailRaw)) {
    return { ok: false, message: "Энэ и-мэйл бүртгэлтэй байна.", status: 409 };
  }
  const newUser = {
    id: `demo-${Date.now()}`,
    username: u,
    password,
    fullName: String(fullName || "").trim(),
    email: emailRaw,
    role: "customer",
  };
  users.push(newUser);
  saveUsers(users);
  return { ok: true, user: serializeUser(newUser) };
}

export function demoLogout() {
  localStorage.removeItem(SESSION_KEY);
}

export function demoUpdateProfile(userId, { fullName, email }) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) {
    return { ok: false, message: "Хэрэглэгч олдсонгүй." };
  }
  const emailRaw = String(email || "").trim().toLowerCase();
  if (emailRaw && users.some((x, i) => i !== idx && x.email === emailRaw)) {
    return { ok: false, message: "Энэ и-мэйл бүртгэлтэй байна." };
  }
  users[idx] = {
    ...users[idx],
    fullName: String(fullName || "").trim(),
    email: emailRaw,
  };
  saveUsers(users);
  return { ok: true, user: serializeUser(users[idx]) };
}

function getOrdersStore() {
  return readJson(ORDERS_KEY, []);
}

function saveOrdersStore(orders) {
  writeJson(ORDERS_KEY, orders);
}

export function demoListOrders(userId) {
  return getOrdersStore()
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function demoCreateOrder(userId, payload) {
  const order = {
    id: `ord-${Date.now()}`,
    userId,
    status: "pending",
    createdAt: new Date().toISOString(),
    ...payload,
  };
  const all = getOrdersStore();
  all.unshift(order);
  saveOrdersStore(all);
  return order;
}

export function demoCancelOrder(userId, orderId) {
  const all = getOrdersStore();
  const idx = all.findIndex((o) => o.id === orderId);
  if (idx < 0 || all[idx].userId !== userId) {
    const err = new Error("Энэ захиалгыг устгах эрх байхгүй.");
    err.status = 403;
    throw err;
  }
  all[idx] = { ...all[idx], status: "cancelled" };
  saveOrdersStore(all);
  return all[idx];
}

export function demoUpdateOrder(userId, orderId, changes) {
  const all = getOrdersStore();
  const idx = all.findIndex((o) => o.id === orderId);
  if (idx < 0 || all[idx].userId !== userId) {
    const err = new Error("Энэ захиалгыг засах эрх байхгүй.");
    err.status = 403;
    throw err;
  }
  all[idx] = { ...all[idx], ...changes };
  saveOrdersStore(all);
  return all[idx];
}
