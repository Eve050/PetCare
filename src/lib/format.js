import { normalizePhone } from "./validate.js"

export function formatPhone(value) {
  const digits = normalizePhone(value)
  if (digits.length !== 10) return String(value || "")
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

export function phoneHref(value) {
  const digits = normalizePhone(value)
  if (!digits.startsWith("0")) return `tel:${digits}`
  return `tel:+593${digits.slice(1)}`
}

export function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "PC"
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return `${parts[0][0]}${last}`.toUpperCase()
}

export function firstName(name) {
  return String(name || "").trim().split(/\s+/)[0] || ""
}

export function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return "Buenos días"
  if (hour < 19) return "Buenas tardes"
  return "Buenas noches"
}

export function nowLabel(date = new Date()) {
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
