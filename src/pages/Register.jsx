import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthLayout from "../components/AuthLayout.jsx"
import { PasswordField, TextField } from "../components/Fields.jsx"
import Modal from "../components/Modal.jsx"
import { useAuth } from "../context/useAuth.js"
import { useTitle } from "../lib/useTitle.js"
import { isEmail, isValidPhone, nameIssue, passwordIssue } from "../lib/validate.js"

const empty = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
  accepted: false,
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  useTitle("Crear cuenta")

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    const next = {}
    const nameError = nameIssue(form.name)
    if (nameError) next.name = nameError
    if (!form.email.trim()) next.email = "Escribe tu correo."
    else if (!isEmail(form.email)) next.email = "Ese correo no tiene un formato válido."
    if (!form.phone.trim()) next.phone = "Escribe tu celular."
    else if (!isValidPhone(form.phone)) next.phone = "Usa un celular de Ecuador, por ejemplo 099 123 4567."
    const passwordError = passwordIssue(form.password)
    if (passwordError) next.password = passwordError
    if (!form.confirm) next.confirm = "Vuelve a escribir la contraseña."
    else if (form.confirm !== form.password) next.confirm = "Las contraseñas no coinciden."
    if (!form.accepted) next.accepted = "Acepta este punto para crear la cuenta."
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    const result = await register(form)
    setLoading(false)
    if (!result.ok) {
      setErrors({ [result.field]: result.message })
      return
    }
    navigate("/inicio", { replace: true })
  }

  return (
    <AuthLayout>
      <p className="eyebrow">Panel del dueño</p>
      <h2>Crear cuenta</h2>
      <p className="lede">Registra tus datos. Después podrás dar de alta a tu mascota y su llavero NFC.</p>
      <form onSubmit={onSubmit} noValidate aria-busy={loading}>
        <TextField
          id="name"
          label="Nombre completo"
          autoComplete="name"
          placeholder="Evelyn Valverde"
          value={form.name}
          onChange={(event) => setField("name", event.target.value)}
          error={errors.name}
        />
        <TextField
          id="email"
          label="Correo electrónico"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck="false"
          placeholder="tucorreo@correo.com"
          value={form.email}
          onChange={(event) => setField("email", event.target.value)}
          error={errors.email}
        />
        <TextField
          id="phone"
          label="Celular"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="099 123 4567"
          value={form.phone}
          onChange={(event) => setField("phone", event.target.value)}
          error={errors.phone}
          hint="Servirá como contacto si autorizas mostrarlo en el perfil público."
        />
        <PasswordField
          id="password"
          label="Contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={(event) => setField("password", event.target.value)}
          error={errors.password}
          hint="Usa letras y al menos un número."
        />
        <PasswordField
          id="confirm"
          label="Confirmar contraseña"
          autoComplete="new-password"
          placeholder="Repite la contraseña"
          value={form.confirm}
          onChange={(event) => setField("confirm", event.target.value)}
          error={errors.confirm}
        />
        <div className={`field${errors.accepted ? " is-error" : ""}`}>
          <label className="check">
            <input
              type="checkbox"
              checked={form.accepted}
              onChange={(event) => setField("accepted", event.target.checked)}
            />
            <span>Entiendo que yo decido qué datos de contacto aparecen en el perfil público.</span>
          </label>
          {errors.accepted ? (
            <p className="field-msg" role="alert">
              {errors.accepted}
            </p>
          ) : null}
          <button type="button" className="text-button" onClick={() => setPrivacyOpen(true)}>
            Qué se comparte al escanear el llavero
          </button>
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
      <p className="auth-switch">
        ¿Ya tienes cuenta?{" "}
        <Link to="/" className="text-link">
          Iniciar sesión
        </Link>
      </p>
      {privacyOpen ? (
        <Modal title="Qué ve quien escanea el llavero" onClose={() => setPrivacyOpen(false)}>
          <p>
            El perfil público muestra el nombre de la mascota, su foto y el contacto que tú autorices: el celular, un
            formulario, o los dos.
          </p>
          <p>Las vacunas, las citas y tu dirección no se publican. Puedes cambiar el contacto después, en Ajustes.</p>
          <div className="modal-actions">
            <button type="button" className="btn btn-primary" onClick={() => setPrivacyOpen(false)}>
              Entendido
            </button>
          </div>
        </Modal>
      ) : null}
    </AuthLayout>
  )
}
