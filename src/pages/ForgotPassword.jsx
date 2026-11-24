import { useState } from "react"
import { Link } from "react-router-dom"
import AuthLayout from "../components/AuthLayout.jsx"
import { PasswordField, TextField } from "../components/Fields.jsx"
import { useAuth } from "../context/useAuth.js"
import { useTitle } from "../lib/useTitle.js"
import { isEmail } from "../lib/validate.js"

export default function ForgotPassword() {
  const { hasAccount, resetPassword } = useAuth()
  const [step, setStep] = useState("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  useTitle("Recuperar contraseña")

  async function onEmail(event) {
    event.preventDefault()
    if (!email.trim()) {
      setErrors({ email: "Escribe el correo de tu cuenta." })
      return
    }
    if (!isEmail(email)) {
      setErrors({ email: "Ese correo no tiene un formato válido." })
      return
    }
    setLoading(true)
    const lookup = await hasAccount(email)
    setLoading(false)
    if (!lookup.ok) {
      setErrors({ email: lookup.message })
      return
    }
    if (!lookup.exists) {
      setErrors({ email: "No encontramos una cuenta con ese correo." })
      return
    }
    setErrors({})
    setStep("password")
  }

  async function onPassword(event) {
    event.preventDefault()
    setLoading(true)
    const result = await resetPassword(email, password, confirm)
    setLoading(false)
    if (!result.ok) {
      setErrors({ [result.field]: result.message })
      return
    }
    setDone(true)
  }

  return (
    <AuthLayout>
      <p className="eyebrow">Panel del dueño</p>
      <h2>Recuperar contraseña</h2>
      {done ? (
        <div className="banner banner-ok" role="status">
          <p>
            <strong>Contraseña actualizada.</strong>
          </p>
          <p>Ya puedes entrar con {email.trim().toLowerCase()} y la nueva contraseña.</p>
          <Link to="/" className="btn btn-primary">
            Ir a iniciar sesión
          </Link>
        </div>
      ) : step === "email" ? (
        <>
          <p className="lede">Escribe el correo con el que creaste la cuenta.</p>
          <form onSubmit={onEmail} noValidate aria-busy={loading}>
            <TextField
              id="email"
              label="Correo electrónico"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="evelyn@petcare.ec"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
            />
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? "Buscando…" : "Continuar"}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="lede">
            Cuenta: <strong>{email.trim().toLowerCase()}</strong>
          </p>
          <form onSubmit={onPassword} noValidate aria-busy={loading}>
            <PasswordField
              id="password"
              label="Nueva contraseña"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
              hint="Usa letras y al menos un número."
            />
            <PasswordField
              id="confirm"
              label="Confirmar contraseña"
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              error={errors.confirm}
            />
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? "Guardando…" : "Guardar contraseña"}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={() => {
                setStep("email")
                setPassword("")
                setConfirm("")
                setErrors({})
              }}
            >
              Usar otro correo
            </button>
          </form>
        </>
      )}
      {!done ? (
        <p className="auth-switch">
          <Link to="/" className="text-link">
            Volver a iniciar sesión
          </Link>
        </p>
      ) : null}
    </AuthLayout>
  )
}
