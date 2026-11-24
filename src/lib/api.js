const TOKEN = "petcare.token.v1"

const unauthorized = new Set()

export function onUnauthorized(listener) {
  unauthorized.add(listener)
  return () => unauthorized.delete(listener)
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN) || sessionStorage.getItem(TOKEN) || ""
  } catch {
    return ""
  }
}

export function setToken(token, remember = true) {
  try {
    localStorage.removeItem(TOKEN)
    sessionStorage.removeItem(TOKEN)
    if (!token) return
    const store = remember ? localStorage : sessionStorage
    store.setItem(TOKEN, token)
  } catch {
    // Sin almacenamiento la sesión dura solo hasta recargar.
  }
}

export async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"
  const token = auth ? getToken() : ""
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    return { ok: false, field: "form", message: "No pudimos conectar con el servidor. Déjalo en marcha con npm run dev." }
  }

  const data = await response.json().catch(() => ({}))
  if (response.status === 401 && token && !path.startsWith("/api/auth/")) {
    setToken(null)
    unauthorized.forEach((listener) => listener())
  }
  if (!response.ok) {
    return {
      ok: false,
      field: data.field || "form",
      message: data.message || "No se pudo completar la acción.",
      code: data.code || "",
    }
  }
  return { ok: true, data }
}

export const api = {
  register: (body) => request("/api/auth/register", { method: "POST", body, auth: false }),
  login: (body) => request("/api/auth/login", { method: "POST", body, auth: false }),
  lookup: (email) => request("/api/auth/lookup", { method: "POST", body: { email }, auth: false }),
  reset: (body) => request("/api/auth/reset", { method: "POST", body, auth: false }),
  me: () => request("/api/me"),
  updateMe: (body) => request("/api/me", { method: "PATCH", body }),
  privacy: (body) => request("/api/me/privacy", { method: "PATCH", body }),
  workspace: () => request("/api/workspace"),
  createPet: (body) => request("/api/pets", { method: "POST", body }),
  deletePet: (id) => request(`/api/pets/${id}`, { method: "DELETE" }),
  setStatus: (id, status) => request(`/api/pets/${id}/status`, { method: "PATCH", body: { status } }),
  createCare: (body) => request("/api/cares", { method: "POST", body }),
  setKey: (id, active) => request(`/api/keys/${id}`, { method: "PATCH", body: { active } }),
  markAlertsRead: () => request("/api/alerts/read", { method: "POST", body: {} }),
  publicProfile: (slug) => request(`/api/public/${slug}`, { auth: false }),
  sendNotice: (slug, body) => request(`/api/public/${slug}/avisos`, { method: "POST", body, auth: false }),
}
