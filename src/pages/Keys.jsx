import { useState } from "react"
import { Link } from "react-router-dom"
import Modal from "../components/Modal.jsx"
import { useWorkspace } from "../context/useWorkspace.js"
import { useTitle } from "../lib/useTitle.js"

export default function Keys() {
  const { keys, setKeyActive } = useWorkspace()
  const [pending, setPending] = useState(null)
  const [note, setNote] = useState("")
  useTitle("Llaveros NFC")

  async function change(key, active) {
    const result = await setKeyActive(key.id, active)
    setPending(null)
    setNote(
      result.ok
        ? active
          ? `El llavero de ${key.petName} volvió a abrir el perfil público.`
          : `Desactivamos el llavero de ${key.petName}. El perfil público ya no muestra el contacto.`
        : result.message,
    )
  }

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="eyebrow">Identificación</p>
          <h1>Llaveros NFC</h1>
          <p className="lede">Cada llavero guarda un código largo. Al escanearlo se abre el perfil público, sin cuenta.</p>
        </div>
      </header>

      {note ? (
        <p className={`banner ${note.startsWith("Desactivamos") || note.startsWith("El llavero") ? "banner-ok" : "banner-error"}`} role="status">
          {note}
        </p>
      ) : null}

      {keys.length === 0 ? (
        <section className="panel empty-card">
          <h2>No hay llaveros</h2>
          <p>Al registrar una mascota se crea su código NFC.</p>
          <Link to="/mascotas" className="btn btn-primary">
            Registrar mascota
          </Link>
        </section>
      ) : null}

      {keys.map((key) => (
        <article className="panel key-card" key={key.id}>
          <div className="pet-top">
            <div>
              <p className="kicker">Vinculado a {key.petName}</p>
              <p className="code">{key.code}</p>
            </div>
            <span className={`badge${key.active ? "" : " badge-lost"}`}>{key.active ? "Activo" : "Inactivo"}</span>
          </div>
          <p>
            Si pierdes el collar, desactiva este llavero. Quien lo acerque al celular ya no verá el contacto de la dueña.
            El enlace del perfil es /perfil/{key.slug}. El mismo enlace podría imprimirse después como código QR.
          </p>
          <div className="pet-actions">
            <Link to={`/perfil/${key.slug}`} className="btn btn-outline">
              Simular escaneo del llavero
            </Link>
            {key.active ? (
              <button type="button" className="btn btn-danger-text" onClick={() => setPending(key)}>
                Desactivar llavero
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => change(key, true)}>
                Activar llavero
              </button>
            )}
          </div>
        </article>
      ))}

      {pending ? (
        <Modal title={`Desactivar el llavero de ${pending.petName}`} onClose={() => setPending(null)}>
          <p>
            Quien escanee este código verá que el llavero está apagado y no encontrará el teléfono. Puedes activarlo de
            nuevo cuando recuperes el collar.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setPending(null)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger" onClick={() => change(pending, false)}>
              Desactivar
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
