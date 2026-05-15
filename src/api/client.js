/**
 * API client — session cookie (httpOnly). Always send credentials for same-site API.
 * Dev: webpack-dev-server proxies /api → PORT (default 4000).
 */
const API_PREFIX = "/api";

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || "Алдаа гарлаа." };
  }
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers = {} } = options;
  const init = {
    method,
    credentials: "include",
    headers: { ...headers },
  };
  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`${API_PREFIX}${path}`, init);
  } catch (e) {
    const msg =
      e && (e.name === "TypeError" || /fetch|network|load failed/i.test(String(e.message)))
        ? "Серверт холбогдож чадсангүй. MongoDB болон API (жишээ нь порт 4000) асаалттай эсэхийг шалгана уу."
        : e && e.message
          ? e.message
          : "Сүлжээний алдаа.";
    const err = new Error(msg);
    err.cause = e;
    throw err;
  }
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function apiGet(path) {
  return apiRequest(path, { method: "GET" });
}

export function apiPost(path, body) {
  return apiRequest(path, { method: "POST", body });
}

export function apiPatch(path, body) {
  return apiRequest(path, { method: "PATCH", body });
}

export function apiDelete(path) {
  return apiRequest(path, { method: "DELETE" });
}
