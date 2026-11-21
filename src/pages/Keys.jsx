import { useState } from "react"
import { Link } from "react-router-dom"
import Modal from "../components/Modal.jsx"
import { keychain } from "../data/example.js"
import { setKeyActive, usePrototype } from "../lib/prototypeStore.js"
import { useTitle } from "../lib/useTitle.js"

export default function Keys() {
  const { keyActive } = usePrototype()
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  useTitle("Llaveros NFC")

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
        <p className="banner banner-ok" role="status">
          {note}
        </p>
      ) : null}

      <article className="panel key-card">
        <div className="pet-top">
          <div>
            <p className="kicker">Vinculado a {keychain.pet}</p>
            <p className="code">{keychain.code}</p>
          </div>
          <span className={`badge${keyActive ? "" : " badge-lost"}`}>{keyActive ? "Activo" : "Inactivo"}</span>
        </div>
        <p>
          Si pierdes el collar, desactiva este llavero. Quien lo acerque al celular ya no verá el contacto de la dueña.
          El mismo enlace podría imprimirse después como código QR, para celulares sin NFC.
        </p>
        <div className="pet-actions">
          <Link to="/perfil/max" className="btn btn-outline">
            Simular escaneo del llavero
          </Link>
          {keyActive ? (
            <button type="button" className="btn btn-danger-text" onClick={() => setOpen(true)}>
              Desactivar llavero
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setKeyActive(true)
                setNote("El llavero volvió a abrir el perfil público de Max.")
              }}
            >
              Activar llavero
            </button>
          )}
        </div>
      </article>

      {open ? (
        <Modal title="Desactivar el llavero de Max" onClose={() => setOpen(false)}>
          <p>
            Quien escanee este código verá que el llavero está apagado y no encontrará el teléfono. Puedes activarlo de
            nuevo cuando vincules otro.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setKeyActive(false)
                setOpen(false)
                setNote("Desactivamos el llavero. El perfil público ya no muestra el contacto.")
              }}
            >
              Desactivar
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
