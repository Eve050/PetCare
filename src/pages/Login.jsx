import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import AuthLayout from "../components/AuthLayout.jsx"
import { PasswordField, TextField } from "../components/Fields.jsx"
import { useAuth } from "../context/useAuth.js"
import { demoCredentials } from "../lib/accounts.js"
import { useTitle } from "../lib/useTitle.js"
import { isEmail } from "../lib/validate.js"
import { wait } from "../lib/wait.js"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  useTitle("Iniciar sesión")

  function fillDemo() {
    setEmail(demoCredentials.email)
    setPassword(demoCredentials.password)
    setErrors({})
  }

  async function onSubmit(event) {
    event.preventDefault()
    const next = {}
    if (!email.trim()) next.email = "Escribe tu correo."
    else if (!isEmail(email)) next.email = "Ese correo no tiene un formato válido."
    if (!password) next.password = "Escribe tu contraseña."
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    await wait()
    const result = login(email, password, remember)
    setLoading(false)
    if (!result.ok) {
      setErrors({ [result.field]: result.message })
      return
    }
    const from = location.state?.from
    const safe = typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
    navigate(safe ? from : "/inicio", { replace: true })
  }

  return (
    <AuthLayout>
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit} noValidate aria-busy={loading}>
        <TextField
          id="email"
          label="Correo"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck="false"
          placeholder="Tu correo"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <PasswordField
          id="password"
          label="Contraseña"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <label className="check">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <span>Recordarme</span>
        </label>
        <div className="gate-forgot">
          <Link to="/recuperar" className="text-link">
            Olvidé mi contraseña
          </Link>
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Entrar al panel"}
        </button>
      </form>
      <p className="auth-switch">
        ¿Aún no tienes cuenta?{" "}
        <Link to="/registro" className="text-link">
          Crear cuenta
        </Link>
      </p>
      <button type="button" className="gate-demo" onClick={fillDemo}>
        Usar la cuenta de ejemplo
      </button>
      <p className="gate-demo-meta">
        {demoCredentials.email} · {demoCredentials.password}
      </p>
    </AuthLayout>
  )
}
