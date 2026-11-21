import { useState } from "react"
import { Link } from "react-router-dom"
import Modal from "../components/Modal.jsx"
import { careIcons } from "../components/careIcons.js"
import { EyeIcon } from "../components/Icons.jsx"
import { useAuth } from "../context/useAuth.js"
import { cares, max } from "../data/example.js"
import { firstName, greeting } from "../lib/format.js"
import { setPetStatus, usePrototype } from "../lib/prototypeStore.js"
import { useTitle } from "../lib/useTitle.js"

export default function Home() {
  const { user } = useAuth()
  const { petStatus, keyActive, extraPets } = usePrototype()
  const [dialog, setDialog] = useState(null)
  const [note, setNote] = useState("")
  const lost = petStatus === "lost"
  useTitle("Inicio")

  function confirmStatus() {
    if (lost) {
      setPetStatus("safe")
      setNote("Quitamos la alerta. El perfil público vuelve a mostrar que Max está a salvo.")
    } else {
      setPetStatus("lost")
      setNote("El perfil público de Max ahora avisa que está extraviado.")
    }
    setDialog(null)
  }

  return (
    <div className="home">
      <header className="home-head">
        <div>
          <h1>
            {greeting()}, {firstName(user.name)}
          </h1>
          <p>Aquí tienes el resumen de Max.</p>
          {extraPets.length > 0 ? (
            <p>
              También registraste {extraPets.length === 1 ? "otra mascota" : `${extraPets.length} mascotas más`}.{" "}
              <Link to="/mascotas" className="text-link">
                Ver mis mascotas
              </Link>
            </p>
          ) : null}
        </div>
      </header>

      {note ? (
        <p className="banner banner-ok" role="status">
          {note}
        </p>
      ) : null}

      <article className="pet-card">
        <div className="pet-photo">
          <img src={max.photo} alt="Max, golden retriever" />
          <span className={`pet-dot${lost ? " is-lost" : ""}`} />
        </div>
        <div className="pet-body">
          <div className="pet-top">
            <div>
              <h2>Max</h2>
              <p className="pet-sub">Golden retriever · 3 años</p>
            </div>
            <span className={`badge${lost ? " badge-lost" : ""}`}>{lost ? "Extraviado" : "A salvo"}</span>
          </div>
          <div className="stats">
            <div className="stat">
              <span>Peso</span>
              <strong>{max.weightLabel}</strong>
            </div>
            <div className="stat">
              <span>Próxima cita</span>
              <strong>{max.nextVisit}</strong>
            </div>
            <div className="stat">
              <span>Llavero</span>
              <strong className={keyActive ? "is-ok" : "is-off"}>{keyActive ? "Activo" : "Inactivo"}</strong>
            </div>
          </div>
          <div className="pet-actions">
            <Link to="/perfil/max" className="btn btn-outline">
              <EyeIcon />
              Ver perfil público
            </Link>
            <button type="button" className="btn btn-danger-text" onClick={() => setDialog("report")}>
              {lost ? "Marcar como encontrada" : "Reportar como extraviado"}
            </button>
          </div>
        </div>
      </article>

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

      <section className="privacy-banner">
        <span className="shield" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3.5 5.5 6.2v5.6c0 4 2.6 6.8 6.5 8.7 3.9-1.9 6.5-4.7 6.5-8.7V6.2L12 3.5z" />
          </svg>
        </span>
        <div className="privacy-copy">
          <h2>Tu privacidad es prioridad</h2>
          <p>Solo tú decides qué información es visible cuando alguien escanea el llavero de Max.</p>
        </div>
        <Link to="/ajustes#privacidad" className="text-link">
          Revisar privacidad
        </Link>
      </section>

      {dialog === "report" ? (
        <Modal
          title={lost ? "¿Max ya apareció?" : "Reportar a Max como extraviado"}
          onClose={() => setDialog(null)}
        >
          <p>
            {lost
              ? "Vamos a quitar la alerta del perfil público. Quien escanee el llavero volverá a ver que está a salvo."
              : "El perfil público mostrará que Max está extraviado y mantendrá el contacto que autorizaste. Las vacunas siguen siendo privadas."}
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

      {dialog === "calendar" ? (
        <Modal title="Calendario de Max" onClose={() => setDialog(null)}>
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
