import { demoOwner } from "../data/example.js"

const USERS_KEY = "petcare.users.v1"
const LOCAL_SESSION = "petcare.session.v1"
const TEMP_SESSION = "petcare.session.temp"

export const demoCredentials = {
  email: "evelyn@petcare.ec",
  password: "Petcare2026",
}

const demoUser = {
  id: "usr_evelyn",
  name: demoOwner.name,
  email: demoCredentials.email,
  phone: demoOwner.phone,
  password: demoCredentials.password,
  plan: "Plan gratuito",
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // La maqueta sigue en memoria si el navegador bloquea el almacenamiento.
  }
}

export function ensureUsers() {
  const users = readJson(USERS_KEY, null)
  if (!Array.isArray(users) || users.length === 0) {
    writeJson(USERS_KEY, [demoUser])
    return [demoUser]
  }
  if (!users.some((user) => user.email === demoUser.email)) {
    const next = [demoUser, ...users]
    writeJson(USERS_KEY, next)
    return next
  }
  return users
}

export function findUser(email) {
  const needle = String(email || "").trim().toLowerCase()
  return ensureUsers().find((user) => user.email.toLowerCase() === needle) || null
}

export function saveUser(user) {
  const users = ensureUsers()
  const index = users.findIndex((item) => item.id === user.id)
  const next = [...users]
  if (index >= 0) next[index] = user
  else next.push(user)
  writeJson(USERS_KEY, next)
}

export function toSession(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    plan: user.plan || "Plan gratuito",
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(LOCAL_SESSION)
    sessionStorage.removeItem(TEMP_SESSION)
  } catch {
    // Sin almacenamiento no hay sesión que borrar.
  }
}

export function readSession() {
  let raw = null
  try {
    raw = localStorage.getItem(LOCAL_SESSION) || sessionStorage.getItem(TEMP_SESSION)
  } catch {
    return null
  }
  if (!raw) return null
  try {
    const session = JSON.parse(raw)
    const user = ensureUsers().find((item) => item.id === session.id)
    if (!user) {
      clearSession()
      return null
    }
    return toSession(user)
  } catch {
    clearSession()
    return null
  }
}

export function writeSession(session, remember) {
  clearSession()
  if (!session) return
  const payload = JSON.stringify(session)
  try {
    if (remember) localStorage.setItem(LOCAL_SESSION, payload)
    else sessionStorage.setItem(TEMP_SESSION, payload)
  } catch {
    // La sesión queda solo en el estado de React hasta recargar.
  }
}

export function persistSession(session) {
  const payload = JSON.stringify(session)
  try {
    if (localStorage.getItem(LOCAL_SESSION)) {
      localStorage.setItem(LOCAL_SESSION, payload)
      return
    }
    if (sessionStorage.getItem(TEMP_SESSION)) {
      sessionStorage.setItem(TEMP_SESSION, payload)
      return
    }
    localStorage.setItem(LOCAL_SESSION, payload)
  } catch {
    // Igual que en writeSession: la pantalla sigue actualizada.
  }
}
