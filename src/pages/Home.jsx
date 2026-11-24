import { useState } from "react"
import { Link } from "react-router-dom"
import Modal from "../components/Modal.jsx"
import PetSwitch from "../components/PetSwitch.jsx"
import { careIcons } from "../components/careIcons.js"
import { EyeIcon } from "../components/Icons.jsx"
import { useAuth } from "../context/useAuth.js"
import { useWorkspace } from "../context/useWorkspace.js"
import { firstName, greeting, initials } from "../lib/format.js"
import { useTitle } from "../lib/useTitle.js"

export default function Home() {
  const { user } = useAuth()
  const { pet, pets, cares, key, setStatus } = useWorkspace()
  const [dialog, setDialog] = useState(null)
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const lost = pet?.status === "lost"
  useTitle("Inicio")

  async function confirmStatus() {
    const next = lost ? "safe" : "lost"
    const result = await setStatus(next)
    if (!result.ok) {
      setError(result.message)
      setDialog(null)
      return
    }
    setError("")
    setNote(
      next === "lost"
        ? `El perfil público de ${pet.name} ahora avisa que está extraviado.`
        : `Quitamos la alerta. El perfil público vuelve a mostrar que ${pet.name} está a salvo.`,
    )
    setDialog(null)
  }

  return (
    <div className="home">
      <header className="home-hero">
        <div>
          <p className="eyebrow">Tu panel</p>
          <h1>
            {greeting()}, {firstName(user.name)}
          </h1>
          <p>{pet ? `Aquí tienes el resumen de ${pet.name}.` : "Registra una mascota para ver su resumen."}</p>
          {pets.length > 1 ? (
            <p>
              Tienes {pets.length} mascotas.{" "}
              <Link to="/mascotas" className="text-link">
                Ver mis mascotas
              </Link>
            </p>
          ) : null}
        </div>
      </header>

      <PetSwitch />

      {note ? (
        <p className="banner banner-ok" role="status">
          {note}
        </p>
      ) : null}
      {error ? (
        <p className="banner banner-error" role="alert">
          {error}
        </p>
      ) : null}

      {pet ? (
        <article className="pet-card">
          <div className="pet-photo">
            {pet.photo ? (
              <img src={pet.photo} alt={`${pet.name}, ${pet.breed}`} />
            ) : (
              <div className="pet-fallback" aria-hidden="true">
                {initials(pet.name)}
              </div>
            )}
            <span className={`pet-dot${lost ? " is-lost" : ""}`} />
          </div>
          <div className="pet-body">
            <div className="pet-top">
              <div>
                <h2>{pet.name}</h2>
                <p className="pet-sub">
                  {pet.breed} · {pet.ageLabel}
                </p>
              </div>
              <span className={`badge${lost ? " badge-lost" : ""}`}>{lost ? "Extraviado" : "A salvo"}</span>
            </div>
            <div className="stats">
              <div className="stat">
                <span>Peso</span>
                <strong>{pet.weightLabel}</strong>
              </div>
              <div className="stat">
                <span>Próxima cita</span>
                <strong>{pet.nextVisit}</strong>
              </div>
              <div className="stat">
                <span>Llavero</span>
                <strong className={key?.active ? "is-ok" : "is-off"}>{key?.active ? "Activo" : "Inactivo"}</strong>
              </div>
            </div>
            <div className="pet-actions">
              <Link to={`/perfil/${pet.slug}`} className="btn btn-outline">
                <EyeIcon />
                Ver perfil público
              </Link>
              <button type="button" className="btn btn-danger-text" onClick={() => setDialog("report")}>
                {lost ? "Marcar como encontrada" : "Reportar como extraviado"}
              </button>
            </div>
          </div>
        </article>
      ) : (
        <section className="panel empty-card">
          <h2>Todavía no hay mascotas</h2>
          <p>Cuando registres un perro o un gato, aquí verás su estado, su próxima cita y su llavero.</p>
          <Link to="/mascotas" className="btn btn-primary">
            Registrar mascota
          </Link>
        </section>
      )}

      {pet ? (
        <>
          <div className="section-head">
            <div>
              <p className="eyebrow">Agenda</p>
              <h2>Próximos cuidados</h2>
            </div>
            <button type="button" className="text-link calendar-link" onClick={() => setDialog("calendar")}>
              Ver calendario
            </button>
          </div>
          <div className="care-grid">
            {cares.map((care) => {
              const Icon = careIcons[care.type]
              return (
                <article className="care-card" key={care.id}>
                  <span className={`care-icon ${care.tone}`}>
                    <Icon />
                  </span>
                  <p className="kicker">{care.kind}</p>
                  <h3>{care.title}</h3>
                  <p className="when">{care.date}</p>
                  <p className="where">{care.place}</p>
                </article>
              )
            })}
          </div>
          {cares.length === 0 ? <p className="lede">Todavía no hay cuidados para {pet.name}.</p> : null}

          <section className="privacy-banner">
            <span className="shield" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3.5 5.5 6.2v5.6c0 4 2.6 6.8 6.5 8.7 3.9-1.9 6.5-4.7 6.5-8.7V6.2L12 3.5z" />
              </svg>
            </span>
            <div className="privacy-copy">
              <h2>Tu privacidad es prioridad</h2>
              <p>Solo tú decides qué información es visible cuando alguien escanea el llavero de {pet.name}.</p>
            </div>
            <Link to="/ajustes#privacidad" className="text-link">
              Revisar privacidad
            </Link>
          </section>
        </>
      ) : null}

      {dialog === "report" && pet ? (
        <Modal
          title={lost ? `¿${pet.name} ya apareció?` : `Reportar a ${pet.name} como extraviado`}
          onClose={() => setDialog(null)}
        >
          <p>
            {lost
              ? "Vamos a quitar la alerta del perfil público. Quien escanee el llavero volverá a ver que está a salvo."
              : `El perfil público mostrará que ${pet.name} está extraviado y mantendrá el contacto que autorizaste. Las vacunas siguen siendo privadas.`}
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setDialog(null)}>
              Cancelar
            </button>
            <button type="button" className={`btn ${lost ? "btn-primary" : "btn-danger"}`} onClick={confirmStatus}>
              {lost ? "Marcar como encontrada" : "Sí, reportar extravío"}
            </button>
          </div>
        </Modal>
      ) : null}

      {dialog === "calendar" && pet ? (
        <Modal title={`Calendario de ${pet.name}`} onClose={() => setDialog(null)}>
          {cares.length === 0 ? <p>Todavía no hay cuidados en la agenda.</p> : null}
          <ul className="calendar-list">
            {cares.map((care) => (
              <li key={care.id}>
                <strong>{care.title}</strong>
                <span>
                  {care.date} · {care.place}
                </span>
              </li>
            ))}
          </ul>
          <div className="modal-actions">
            <Link to="/cuidados" className="btn btn-primary" onClick={() => setDialog(null)}>
              Ver cuidados
            </Link>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
