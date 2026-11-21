import { useState } from "react"
import { Link } from "react-router-dom"
import Logo from "../components/Logo.jsx"
import { useAuth } from "../context/useAuth.js"
import { demoOwner, max } from "../data/example.js"
import { formatPhone, nowLabel, phoneHref } from "../lib/format.js"
import { addAlert, usePrototype } from "../lib/prototypeStore.js"
import { useTitle } from "../lib/useTitle.js"

export default function PublicProfile() {
  const { user } = useAuth()
  const { petStatus, keyActive, privacy } = usePrototype()
  const [name, setName] = useState("")
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const owner = user ? { name: user.name, phone: user.phone } : demoOwner
  const lost = petStatus === "lost"
  useTitle(`Perfil de ${max.name}`)

  function onSubmit(event) {
    event.preventDefault()
    if (name.trim().length < 2) {
      setError("Escribe tu nombre para que la dueña sepa quién avisó.")
      return
    }
    if (text.trim().length < 8) {
      setError("Cuéntale un poco más: dónde viste a Max y cómo contactarte.")
      return
    }
    addAlert({
      id: crypto.randomUUID(),
      title: `${name.trim()} escribió sobre Max`,
      meta: text.trim(),
      at: nowLabel(),
    })
    setSent(true)
    setError("")
  }

  return (
    <div className="public-page">
      <a className="skip" href="#contenido">
        Saltar al perfil
      </a>
      <main className="public-wrap" id="contenido">
        <div className="public-top">
          <Logo to={user ? "/inicio" : "/"} />
          <Link to={user ? "/inicio" : "/"} className="text-link">
            {user ? "Volver al panel" : "Soy la dueña"}
          </Link>
        </div>
        <p className="public-note">Así se ve el perfil al escanear el llavero. No pide cuenta.</p>
        <article className="public-card">
          <img className="hero" src={max.photo} alt="Max, golden retriever" />
          <div className="public-body">
            {!keyActive ? (
              <div className="off-banner">
                <strong>Este llavero está desactivado</strong>
                <p>La dueña lo apagó desde su cuenta. El contacto no se muestra hasta que vuelva a activarlo.</p>
              </div>
            ) : (
              <>
                {lost ? (
                  <div className="lost-banner">
                    <strong>Max está extraviado</strong>
                    <p>Si lo encontraste, contacta a su dueña con los datos que ella autorizó.</p>
                  </div>
                ) : (
                  <span className="badge">A salvo</span>
                )}
                <h1>Max</h1>
                <p className="pet-sub">
                  {max.species} · {max.breed} · {max.ageLabel}
                </p>
                <p className="where">Dueña: {owner.name}</p>
                <p className="field-hint">Las vacunas, las citas y la dirección no se muestran aquí.</p>

                {privacy.showPhone ? (
                  <div className="contact-card">
                    <p className="kicker">Celular autorizado</p>
                    <a className="phone-link" href={phoneHref(owner.phone)}>
                      {formatPhone(owner.phone)}
                    </a>
                  </div>
                ) : null}

                {privacy.showForm ? (
                  <div className="contact-card">
                    <p className="kicker">Encontré a esta mascota</p>
                    {sent ? (
                      <p className="banner banner-ok" role="status">
                        Listo. El aviso quedó en la campana del panel, en este navegador.
                      </p>
                    ) : (
                      <form onSubmit={onSubmit} noValidate className="stack-form">
                        <div className="field">
                          <label htmlFor="finder-name">Tu nombre</label>
                          <input
                            id="finder-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Ana"
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="finder-text">Mensaje</label>
                          <textarea
                            id="finder-text"
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            placeholder="Lo vi en el parque Isidro Ayora, cerca de la entrada."
                          />
                        </div>
                        {error ? (
                          <p className="field-msg" role="alert">
                            {error}
                          </p>
                        ) : null}
                        <button type="submit" className="btn btn-primary btn-block">
                          Enviar aviso a la dueña
                        </button>
                      </form>
                    )}
                  </div>
                ) : null}

                {!privacy.showPhone && !privacy.showForm ? (
                  <div className="off-banner">
                    <strong>No hay un medio de contacto visible</strong>
                    <p>
                      {user
                        ? "Activa el celular o el formulario en Ajustes para que puedan avisarte."
                        : "La dueña todavía no publicó un teléfono ni el formulario."}
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </article>
      </main>
    </div>
  )
}
