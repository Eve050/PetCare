import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import Logo from "../components/Logo.jsx"
import { useAuth } from "../context/useAuth.js"
import { api } from "../lib/api.js"
import { formatPhone, initials, phoneHref } from "../lib/format.js"
import { useTitle } from "../lib/useTitle.js"

export default function PublicProfile() {
  const { slug } = useParams()
  return <PublicProfileView key={slug} slug={slug} />
}

function PublicProfileView({ slug }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [missing, setMissing] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [name, setName] = useState("")
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  useTitle(profile?.pet?.name ? `Perfil de ${profile.pet.name}` : "Perfil público")

  useEffect(() => {
    let cancel = false
    async function load() {
      const result = await api.publicProfile(slug)
      if (cancel) return
      if (!result.ok) {
        if (result.code === "not_found") setMissing(true)
        else setLoadError(result.message)
        return
      }
      setProfile(result.data)
    }
    load()
    return () => {
      cancel = true
    }
  }, [slug])

  async function onSubmit(event) {
    event.preventDefault()
    setSending(true)
    const result = await api.sendNotice(slug, { name, message: text })
    setSending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setSent(true)
    setError("")
  }

  const pet = profile?.pet
  const photos = pet?.photos?.length ? pet.photos : pet?.photo ? [pet.photo] : []
  const shown = photos[photoIndex] || photos[0]
  const lost = pet?.status === "lost"

  return (
    <div className="public-page">
      <a className="skip" href="#contenido">
        Saltar al perfil
      </a>
      <header className="public-top">
        <Logo to={user ? "/inicio" : "/"} />
        <Link to={user ? "/inicio" : "/"} className="public-back">
          {user ? "Volver al panel" : "Soy la dueña"}
        </Link>
      </header>
      <main className="public-wrap" id="contenido">

        {loadError ? (
          <p className="banner banner-error" role="alert">
            {loadError}
          </p>
        ) : null}

        {!profile && !missing && !loadError ? (
          <p className="lede public-status" role="status">
            Cargando el perfil…
          </p>
        ) : null}

        {missing ? (
          <article className="public-card">
            <div className="public-body">
              <h1>No encontramos este llavero</h1>
              <p>El código no corresponde a una mascota registrada, o su dueño borró el perfil.</p>
            </div>
          </article>
        ) : null}

        {profile ? (
          <article className="public-card">
            {profile.active && shown ? (
              <img className="hero" src={shown} alt={`${pet.name}, ${pet.breed}`} />
            ) : null}
            {profile.active && pet && !pet.photo ? (
              <div className="hero pet-fallback" aria-hidden="true">
                {initials(pet.name)}
              </div>
            ) : null}
            <div className="public-body">
              {!profile.active ? (
                <div className="off-banner">
                  <strong>El llavero de {pet.name} está desactivado</strong>
                  <p>La dueña lo apagó desde su cuenta. El contacto no se muestra hasta que vuelva a activarlo.</p>
                </div>
              ) : (
                <>
                  {lost ? (
                    <div className="lost-banner">
                      <strong>{pet.name} está extraviado</strong>
                      <p>Si lo encontraste, contacta a su dueña con los datos que ella autorizó.</p>
                    </div>
                  ) : (
                    <span className="badge">A salvo</span>
                  )}
                  {photos.length > 1 ? (
                    <div className="photo-picks" role="tablist" aria-label="Fotos de la mascota">
                      {photos.map((src, index) => (
                        <button
                          key={`${index}-${src.slice(-24)}`}
                          type="button"
                          className={index === photoIndex ? "on" : ""}
                          aria-label={`Foto ${index + 1}`}
                          onClick={() => setPhotoIndex(index)}
                        >
                          <img src={src} alt="" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <h1>{pet.name}</h1>
                  <p className="pet-sub">
                    {pet.species} · {pet.breed} · {pet.ageLabel}
                  </p>
                  <p className="where">Dueña: {profile.ownerName}</p>
                  <p className="field-hint">Las vacunas, las citas y la dirección no se muestran aquí.</p>

                  {profile.showPhone && profile.phone ? (
                    <div className="contact-card">
                      <p className="kicker">Celular autorizado</p>
                      <a className="phone-link" href={phoneHref(profile.phone)}>
                        {formatPhone(profile.phone)}
                      </a>
                    </div>
                  ) : null}

                  {profile.showForm ? (
                    <div className="contact-card">
                      <p className="kicker">Encontré a esta mascota</p>
                      {sent ? (
                        <p className="banner banner-ok" role="status">
                          Listo. El aviso quedó en la campana del panel de la dueña.
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
                          <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
                            {sending ? "Enviando…" : "Enviar aviso a la dueña"}
                          </button>
                        </form>
                      )}
                    </div>
                  ) : null}

                  {!profile.showPhone && !profile.showForm ? (
                    <div className="off-banner">
                      <strong>No hay un medio de contacto visible</strong>
                      <p>La dueña todavía no publicó un teléfono ni el formulario.</p>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </article>
        ) : null}
      </main>
    </div>
  )
}
