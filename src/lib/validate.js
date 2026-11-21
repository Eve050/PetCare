export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim())
}

export function normalizePhone(value) {
  let digits = String(value || "").replace(/\D/g, "")
  if (digits.startsWith("593") && digits.length === 12) digits = `0${digits.slice(3)}`
  return digits
}

export function isValidPhone(value) {
  return /^09\d{8}$/.test(normalizePhone(value))
}

export function nameIssue(value) {
  const clean = String(value || "").trim().replace(/\s+/g, " ")
  if (clean.length < 3) return "Escribe tu nombre."
  if (!clean.includes(" ")) return "Escribe tu nombre y tu apellido."
  if (clean.length > 60) return "Ese nombre es demasiado largo."
  return ""
}

export function passwordIssue(value) {
  if (!value) return "Escribe una contraseña."
  if (value.length < 8) return "Usa al menos 8 caracteres."
  if (value.length > 64) return "Usa menos de 64 caracteres."
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(value) || !/\d/.test(value)) {
    return "Incluye letras y al menos un número."
  }
  return ""
}
