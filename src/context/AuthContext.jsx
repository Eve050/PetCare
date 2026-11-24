import { useCallback, useEffect, useMemo, useState } from "react"
import { AuthContext } from "./auth-context.js"
import { api, getToken, onUnauthorized, setToken } from "../lib/api.js"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => onUnauthorized(() => setUser(null)), [])

  useEffect(() => {
    let cancel = false
    async function boot() {
      if (!getToken()) {
        if (!cancel) setReady(true)
        return
      }
      const result = await api.me()
      if (cancel) return
      if (result.ok) setUser(result.data.user)
      else setToken(null)
      setReady(true)
    }
    boot()
    return () => {
      cancel = true
    }
  }, [])

  const login = useCallback(async (email, password, remember) => {
    const result = await api.login({ email, password })
    if (!result.ok) return result
    setToken(result.data.token, remember)
    setUser(result.data.user)
    return { ok: true }
  }, [])

  const register = useCallback(async (data) => {
    const result = await api.register(data)
    if (!result.ok) return result
    setToken(result.data.token, true)
    setUser(result.data.user)
    return { ok: true }
  }, [])

  const hasAccount = useCallback(async (email) => {
    const result = await api.lookup(email)
    if (!result.ok) return result
    return { ok: true, exists: result.data.exists }
  }, [])

  const resetPassword = useCallback(async (email, password, confirm) => {
    return api.reset({ email, password, confirm })
  }, [])

  const updateProfile = useCallback(async (data) => {
    const result = await api.updateMe(data)
    if (!result.ok) return result
    setUser(result.data.user)
    return result
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, ready, login, register, hasAccount, resetPassword, updateProfile, logout }),
    [user, ready, login, register, hasAccount, resetPassword, updateProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
