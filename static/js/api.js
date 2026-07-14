/* Утилиты: экранирование, хранилище токенов, тосты и обёртки над fetch с JWT. */
import { renderNav } from "./nav.js";

const API = "/api";

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

export const tokens = {
  get access() { return localStorage.getItem("access"); },
  get refresh() { return localStorage.getItem("refresh"); },
  set(access, refresh) {
    localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
  },
  clear() { localStorage.removeItem("access"); localStorage.removeItem("refresh"); },
};

export function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.hidden = true; }, 3500);
}

export async function api(path, options = {}) {
  const headers = options.headers || {};
  if (!(options.body instanceof FormData) && options.body) {
    headers["Content-Type"] = "application/json";
  }
  if (tokens.access) headers["Authorization"] = "Bearer " + tokens.access;

  let res = await fetch(API + path, { ...options, headers });

  if (res.status === 401 && tokens.refresh) {
    const rr = await fetch(API + "/auth/jwt/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });
    if (rr.ok) {
      const data = await rr.json();
      tokens.set(data.access);
      headers["Authorization"] = "Bearer " + data.access;
      res = await fetch(API + path, { ...options, headers });
    } else {
      tokens.clear();
      renderNav();
    }
  }
  return res;
}

export async function apiJson(path, options) {
  const res = await api(path, options);
  if (!res.ok) {
    let detail = "Ошибка запроса (" + res.status + ")";
    try {
      const data = await res.json();
      detail = data.detail || Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
        .join("; ") || detail;
    } catch (_) { /* не JSON */ }
    throw new Error(detail);
  }
  return res.status === 204 ? null : res.json();
}

export const isAuthed = () => Boolean(tokens.access);

export function requireAuth() {
  if (!isAuthed()) {
    location.hash = "#/login";
    return false;
  }
  return true;
}
