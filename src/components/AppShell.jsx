import { useEffect, useRef, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth.js"
import { cares } from "../data/example.js"
import { initials } from "../lib/format.js"
import { markAlertsRead, usePrototype } from "../lib/prototypeStore.js"
import {
  BellIcon,
  CareIcon,
  ChevronIcon,
  HomeIcon,
  LogoutIcon,
  MenuIcon,
  NfcIcon,
  PetIcon,
  SettingsIcon,
} from "./Icons.jsx"
import Logo from "./Logo.jsx"

const links = [
  { to: "/inicio", label: "Inicio", icon: HomeIcon },
  { to: "/mascotas", label: "Mis mascotas", icon: PetIcon },
  { to: "/cuidados", label: "Cuidados", icon: CareIcon },
  { to: "/llaveros", label: "Llaveros NFC", icon: NfcIcon },
  { to: "/ajustes", label: "Ajustes", icon: SettingsIcon },
]

function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [query])
  return matches
}

function BellMenu() {
  const { alerts, unread } = usePrototype()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  function toggle() {
    setOpen((value) => {
      const next = !value
      if (next) markAlertsRead()
      return next
    })
  }

  return (
    <div className="bell-wrap" ref={wrapRef}>
      <button
        type="button"
        className="icon-btn"
        aria-label={unread ? "Avisos, hay mensajes nuevos" : "Avisos"}
        aria-expanded={open}
        onClick={toggle}
      >
        <BellIcon />
        {unread ? <span className="bell-dot" /> : null}
      </button>
      {open ? (
        <div className="bell-menu" role="menu">
          {alerts.length > 0 ? (
            <>
              <p className="bell-label">Avisos sobre Max</p>
              {alerts.map((alert) => (
                <div className="bell-item static" key={alert.id}>
                  <strong>{alert.title}</strong>
                  <span>{alert.meta}</span>
                  <small>{alert.at}</small>
                </div>
              ))}
            </>
          ) : null}
          <p className="bell-label">Próximos cuidados</p>
          {cares.map((care) => (
            <Link
              key={care.id}
              to="/cuidados"
              className="bell-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <strong>{care.title}</strong>
              <span>
                {care.date} · {care.place}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMedia("(max-width: 900px)")
  const [openPath, setOpenPath] = useState(null)
  const open = openPath === location.pathname

  function closeMenu() {
    setOpenPath(null)
  }

  function toggleMenu() {
    setOpenPath((current) => (current === location.pathname ? null : location.pathname))
  }

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === "Escape") setOpenPath(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  useEffect(() => {
    if (!open || !isMobile) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open, isMobile])

  function onLogout() {
    logout()
    navigate("/")
  }

  return (
    <div className={`shell${open ? " nav-open" : ""}`}>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      {open && isMobile ? (
        <button type="button" className="nav-backdrop" aria-label="Cerrar menú" onClick={closeMenu} />
      ) : null}
      <aside className="sidebar" inert={isMobile && !open ? true : undefined}>
        <Logo to="/inicio" />
        <p className="side-label">Menú principal</p>
        <nav className="side-nav" aria-label="Principal">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) => `side-link${isActive ? " active" : ""}`}
              >
                <Icon />
                {link.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="side-foot">
          <Link to="/ajustes" className="user-chip">
            <span className="avatar avatar-sm">{initials(user.name)}</span>
            <span>
              <strong>{user.name}</strong>
              <small>{user.plan}</small>
            </span>
            <ChevronIcon />
          </Link>
          <button type="button" className="logout" onClick={onLogout}>
            <LogoutIcon />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="shell-main">
        <div className="shell-top">
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={toggleMenu}
          >
            <MenuIcon />
          </button>
          <Logo to="/inicio" className="logo-mobile" />
          <div className="top-actions">
            <BellMenu />
            <Link to="/ajustes" className="avatar" aria-label={`Cuenta de ${user.name}`}>
              {initials(user.name)}
            </Link>
          </div>
        </div>
        <main className="shell-content" id="contenido">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
