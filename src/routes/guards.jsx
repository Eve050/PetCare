import { Navigate, Outlet, useLocation } from "react-router-dom"
import ScreenWait from "../components/ScreenWait.jsx"
import { useAuth } from "../context/useAuth.js"

export function RequireAuth() {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <ScreenWait />
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function GuestOnly() {
  const { user, ready } = useAuth()
  if (!ready) return <ScreenWait />
  if (user) return <Navigate to="/inicio" replace />
  return <Outlet />
}
