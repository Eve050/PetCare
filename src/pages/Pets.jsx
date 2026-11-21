import { useState } from "react"
import { Link } from "react-router-dom"
import { TextField } from "../components/Fields.jsx"
import Modal from "../components/Modal.jsx"
import { PlusIcon } from "../components/Icons.jsx"
import { max } from "../data/example.js"
import { initials } from "../lib/format.js"
import { addPet, removePet, usePrototype } from "../lib/prototypeStore.js"
import { useTitle } from "../lib/useTitle.js"

const empty = { name: "", species: "Perro", breed: "", age: "", weight: "" }

export default function Pets() {
  const { extraPets, petStatus } = usePrototype()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [pendingDelete, setPendingDelete] = useState(null)
  const [note, setNote] = useState("")
  useTitle("Mis mascotas")

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function onCreate(event) {
    event.preventDefault()
    const next = {}
    if (form.name.trim().length < 2) next.name = "Escribe el nombre de la mascota."
    if (!form.breed.trim()) next.breed = "Escribe la raza."
    const age = Number(form.age)
    if (form.age === "" || Number.isNaN(age) || age < 0 || age > 30) next.age = "La edad va de 0 a 30 años."
    const weight = Number(String(form.weight).replace(",", "."))
    if (form.weight === "" || Number.isNaN(weight) || weight < 0.2 || weight > 90) {
      next.weight = "Revisa el peso en kilogramos."
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const pet = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim(),
      ageLabel: age === 1 ? "1 año" : `${age} años`,
      weightLabel: `${String(form.weight).replace(",", ".")} kg`,
    }
    addPet(pet)
    setForm(empty)
    setOpen(false)
    setNote(`${pet.name} quedó registrada en este navegador.`)
  }

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="eyebrow">Perfiles</p>
          <h1>Mis mascotas</h1>
          <p className="lede">Cada perfil puede vincularse a su propio llavero NFC.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
          <PlusIcon />
          Registrar mascota
        </button>
      </header>

      {note ? (
        <p className="banner banner-ok" role="status">
          {note}
        </p>
      ) : null}

      <div className="pet-grid">
        <article className="mini-pet">
          <img src={max.photo} alt="Max" />
          <div>
            <span className={`badge${petStatus === "lost" ? " badge-lost" : ""}`}>
              {petStatus === "lost" ? "Extraviado" : "A salvo"}
            </span>
            <h2>Max</h2>
            <p>
              {max.species} · {max.breed}
            </p>
            <p>
              {max.ageLabel} · {max.weightLabel}
            </p>
            <Link to="/perfil/max" className="text-link">
              Ver perfil público
            </Link>
          </div>
        </article>

        {extraPets.map((pet) => (
          <article className="mini-pet" key={pet.id}>
            <div className="mini-fallback" aria-hidden="true">
              {initials(pet.name)}
            </div>
            <div>
              <span className="badge">Sin llavero</span>
              <h2>{pet.name}</h2>
              <p>
                {pet.species} · {pet.breed}
              </p>
              <p>
                {pet.ageLabel} · {pet.weightLabel}
              </p>
              <button type="button" className="btn btn-danger-text" onClick={() => setPendingDelete(pet)}>
                Quitar
              </button>
            </div>
          </article>
        ))}
      </div>

      {open ? (
        <Modal title="Registrar mascota" onClose={() => setOpen(false)}>
          <form onSubmit={onCreate} noValidate className="stack-form">
            <TextField
              id="pet-name"
              label="Nombre"
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              error={errors.name}
              placeholder="Luna"
            />
            <div className="field">
              <label htmlFor="pet-species">Especie</label>
              <select
                id="pet-species"
                value={form.species}
                onChange={(event) => setField("species", event.target.value)}
              >
                <option>Perro</option>
                <option>Gato</option>
              </select>
            </div>
            <TextField
              id="pet-breed"
              label="Raza"
              value={form.breed}
              onChange={(event) => setField("breed", event.target.value)}
              error={errors.breed}
              placeholder="Mestizo"
            />
            <div className="split">
              <TextField
                id="pet-age"
                label="Edad"
                inputMode="decimal"
                value={form.age}
                onChange={(event) => setField("age", event.target.value)}
                error={errors.age}
                placeholder="2"
                hint="Años"
              />
              <TextField
                id="pet-weight"
                label="Peso"
                inputMode="decimal"
                value={form.weight}
                onChange={(event) => setField("weight", event.target.value)}
                error={errors.weight}
                placeholder="12"
                hint="Kilogramos"
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar mascota
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {pendingDelete ? (
        <Modal title={`Quitar a ${pendingDelete.name}`} onClose={() => setPendingDelete(null)}>
          <p>Se borrará de esta maqueta, en este navegador. Max se queda como ejemplo del proyecto.</p>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setPendingDelete(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                removePet(pendingDelete.id)
                setNote(`Quitamos a ${pendingDelete.name} de la lista.`)
                setPendingDelete(null)
              }}
            >
              Quitar
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
