import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/useAuth.js"

export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function GuestOnly() {
  const { user } = useAuth()
  if (user) return <Navigate to="/inicio" replace />
  return <Outlet />
}
