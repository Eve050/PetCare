import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/useAuth.js"
import { formatPhone } from "../lib/format.js"
import { setPrivacy, usePrototype } from "../lib/prototypeStore.js"
import { useTitle } from "../lib/useTitle.js"

function Switch({ id, checked, onChange, disabled, label }) {
  return (
    <button
      id={id}
      type="button"
      className={`switch${checked ? " on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  )
}

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const { privacy } = usePrototype()
  const location = useLocation()
  const [draft, setDraft] = useState(null)
  const name = draft?.name ?? user.name
  const phone = draft?.phone ?? formatPhone(user.phone)
  const [errors, setErrors] = useState({})
  const [note, setNote] = useState("")
  useTitle("Ajustes")

  function edit(partial) {
    setDraft((current) => ({
      name: current?.name ?? user.name,
      phone: current?.phone ?? formatPhone(user.phone),
      ...partial,
    }))
  }

  useEffect(() => {
    if (location.hash === "#privacidad") {
      document.getElementById("privacidad")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [location.hash])

  function onSave(event) {
    event.preventDefault()
    const result = updateProfile({ name, phone })
    if (!result.ok) {
      setNote("")
      setErrors({ [result.field]: result.message })
      return
    }
    setDraft(null)
    setErrors({})
    setNote("Guardamos tus datos en este navegador.")
  }

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="eyebrow">Cuenta</p>
          <h1>Ajustes</h1>
          <p className="lede">Tus datos de dueño y lo que puede ver quien encuentre a Max.</p>
        </div>
      </header>

      {note ? (
        <p className="banner banner-ok" role="status">
          {note}
        </p>
      ) : null}
      {errors.form ? (
        <p className="banner banner-error" role="alert">
          {errors.form}
        </p>
      ) : null}

      <section className="panel">
        <h2>Datos de la cuenta</h2>
        <form onSubmit={onSave} noValidate className="stack-form">
          <div className={`field${errors.name ? " is-error" : ""}`}>
            <label htmlFor="settings-name">Nombre completo</label>
            <input id="settings-name" value={name} onChange={(event) => edit({ name: event.target.value })} />
            {errors.name ? (
              <p className="field-msg" role="alert">
                {errors.name}
              </p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="settings-email">Correo</label>
            <input id="settings-email" value={user.email} readOnly />
            <p className="field-hint">El correo es tu usuario de acceso.</p>
          </div>
          <div className={`field${errors.phone ? " is-error" : ""}`}>
            <label htmlFor="settings-phone">Celular</label>
            <input
              id="settings-phone"
              inputMode="tel"
              value={phone}
              onChange={(event) => edit({ phone: event.target.value })}
            />
            {errors.phone ? (
              <p className="field-msg" role="alert">
                {errors.phone}
              </p>
            ) : (
              <p className="field-hint">Ejemplo: 099 123 4567</p>
            )}
          </div>
          <p className="plan-pill">{user.plan}</p>
          <div className="modal-actions left">
            <button type="submit" className="btn btn-primary">
              Guardar datos
            </button>
          </div>
        </form>
      </section>

      <section className="panel" id="privacidad">
        <h2>Privacidad del perfil público</h2>
        <p className="lede">Estos cambios se ven al instante en el perfil que abre el llavero.</p>
        <div className="toggle-row">
          <Switch
            id="show-phone"
            label="Mostrar mi celular"
            checked={privacy.showPhone}
            onChange={(value) => setPrivacy({ showPhone: value })}
          />
          <div>
            <strong>Mostrar mi celular</strong>
            <p>Quien encuentre a Max puede llamar al número de esta cuenta.</p>
          </div>
        </div>
        <div className="toggle-row">
          <Switch
            id="show-form"
            label="Mostrar formulario de contacto"
            checked={privacy.showForm}
            onChange={(value) => setPrivacy({ showForm: value })}
          />
          <div>
            <strong>Mostrar el formulario de contacto</strong>
            <p>La persona escribe un aviso y aparece en la campana del panel.</p>
          </div>
        </div>
        <div className="toggle-row">
          <Switch id="hide-address" label="Ocultar dirección" checked disabled onChange={() => {}} />
          <div>
            <strong>Ocultar mi dirección</strong>
            <p>En PetCare la dirección nunca se publica. Esta opción queda fija.</p>
          </div>
        </div>
        <p className="panel-link">
          <Link to="/perfil/max" className="text-link">
            Ver cómo quedó el perfil público
          </Link>
        </p>
      </section>
    </div>
  )
}
