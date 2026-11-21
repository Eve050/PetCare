import { useCallback, useMemo, useState } from "react"
import { AuthContext } from "./auth-context.js"
import {
  clearSession,
  findUser,
  persistSession,
  readSession,
  saveUser,
  toSession,
  writeSession,
} from "../lib/accounts.js"
import { isEmail, isValidPhone, nameIssue, normalizePhone, passwordIssue } from "../lib/validate.js"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession())

  const login = useCallback((email, password, remember) => {
    const found = findUser(email)
    if (!found) {
      return { ok: false, field: "email", message: "No encontramos una cuenta con ese correo." }
    }
    if (found.password !== password) {
      return { ok: false, field: "password", message: "La contraseña no coincide." }
    }
    const session = toSession(found)
    writeSession(session, remember)
    setUser(session)
    return { ok: true }
  }, [])

  const register = useCallback((data) => {
    const issue = nameIssue(data.name)
    if (issue) return { ok: false, field: "name", message: issue }
    if (!isEmail(data.email)) {
      return { ok: false, field: "email", message: "Escribe un correo válido." }
    }
    if (!isValidPhone(data.phone)) {
      return { ok: false, field: "phone", message: "Usa un celular de Ecuador, por ejemplo 099 123 4567." }
    }
    const passwordError = passwordIssue(data.password)
    if (passwordError) return { ok: false, field: "password", message: passwordError }
    if (data.password !== data.confirm) {
      return { ok: false, field: "confirm", message: "Las contraseñas no coinciden." }
    }
    if (!data.accepted) {
      return { ok: false, field: "accepted", message: "Acepta este punto para crear la cuenta." }
    }
    if (findUser(data.email)) {
      return { ok: false, field: "email", message: "Ese correo ya tiene una cuenta. Inicia sesión." }
    }
    const created = {
      id: crypto.randomUUID(),
      name: data.name.trim().replace(/\s+/g, " "),
      email: data.email.trim().toLowerCase(),
      phone: normalizePhone(data.phone),
      password: data.password,
      plan: "Plan gratuito",
    }
    saveUser(created)
    const session = toSession(created)
    writeSession(session, true)
    setUser(session)
    return { ok: true }
  }, [])

  const hasAccount = useCallback((email) => Boolean(findUser(email)), [])

  const resetPassword = useCallback((email, password, confirm) => {
    const found = findUser(email)
    if (!found) {
      return { ok: false, field: "email", message: "No encontramos una cuenta con ese correo." }
    }
    const passwordError = passwordIssue(password)
    if (passwordError) return { ok: false, field: "password", message: passwordError }
    if (password !== confirm) {
      return { ok: false, field: "confirm", message: "Las contraseñas no coinciden." }
    }
    saveUser({ ...found, password })
    return { ok: true }
  }, [])

  const updateProfile = useCallback((data) => {
    if (!user) return { ok: false, field: "form", message: "Vuelve a iniciar sesión." }
    const issue = nameIssue(data.name)
    if (issue) return { ok: false, field: "name", message: issue }
    if (!isValidPhone(data.phone)) {
      return { ok: false, field: "phone", message: "Usa un celular de Ecuador, por ejemplo 099 123 4567." }
    }
    const current = findUser(user.email)
    if (!current) return { ok: false, field: "form", message: "Vuelve a iniciar sesión." }
    const next = {
      ...current,
      name: data.name.trim().replace(/\s+/g, " "),
      phone: normalizePhone(data.phone),
    }
    saveUser(next)
    const session = toSession(next)
    persistSession(session)
    setUser(session)
    return { ok: true }
  }, [user])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, login, register, hasAccount, resetPassword, updateProfile, logout }),
    [user, login, register, hasAccount, resetPassword, updateProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
