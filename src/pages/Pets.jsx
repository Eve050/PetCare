import { useState } from "react"
import { Link } from "react-router-dom"
import { TextField } from "../components/Fields.jsx"
import Modal from "../components/Modal.jsx"
import { PlusIcon } from "../components/Icons.jsx"
import { useWorkspace } from "../context/useWorkspace.js"
import { initials } from "../lib/format.js"
import { useTitle } from "../lib/useTitle.js"

const empty = { name: "", species: "Perro", breed: "", age: "", weight: "" }

function readPhoto(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)
    image.onload = () => {
      const max = 1280
      const scale = Math.min(1, max / Math.max(image.width, image.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/jpeg", 0.82))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("foto"))
    }
    image.src = url
  })
}

export default function Pets() {
  const { pets, keys, createPet, deletePet } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [pendingDelete, setPendingDelete] = useState(null)
  const [photos, setPhotos] = useState([])
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  useTitle("Mis mascotas")

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function closeForm() {
    setOpen(false)
    setPhotos([])
    setErrors({})
  }

  async function onPhotos(event) {
    const files = [...event.target.files]
    event.target.value = ""
    if (files.length === 0) return
    const room = 3 - photos.length
    if (room <= 0) {
      setErrors((current) => ({ ...current, photos: "Puedes subir hasta 3 fotos." }))
      return
    }
    try {
      const next = []
      for (const file of files.slice(0, room)) {
        if (!file.type.startsWith("image/")) continue
        next.push(await readPhoto(file))
      }
      setPhotos((current) => [...current, ...next].slice(0, 3))
      setErrors((current) => ({ ...current, photos: files.length > room ? "Puedes subir hasta 3 fotos." : "" }))
    } catch {
      setErrors((current) => ({ ...current, photos: "No pudimos leer una de las fotos." }))
    }
  }

  async function onCreate(event) {
    event.preventDefault()
    const next = {}
    if (form.name.trim().length < 2) next.name = "Escribe el nombre de la mascota."
    if (!form.breed.trim()) next.breed = "Escribe la raza."
    const age = Number(form.age)
    if (form.age === "" || !Number.isInteger(age) || age < 0 || age > 30) next.age = "La edad va de 0 a 30 años."
    const weight = Number(String(form.weight).replace(",", "."))
    if (form.weight === "" || Number.isNaN(weight) || weight < 0.2 || weight > 90) {
      next.weight = "Revisa el peso en kilogramos."
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSaving(true)
    const result = await createPet({
      name: form.name,
      species: form.species,
      breed: form.breed,
      age,
      weight,
      photos,
    })
    setSaving(false)
    if (!result.ok) {
      setErrors({ [result.field]: result.message })
      return
    }
    const created = result.data.pets.find((pet) => pet.id === result.data.createdPetId)
    const key = result.data.keys.find((item) => item.petId === result.data.createdPetId)
    setForm(empty)
    setPhotos([])
    setOpen(false)
    setNote(
      created
        ? `${created.name} quedó registrada. Su llavero es ${key?.code || "nuevo"} y ya abre su perfil público.`
        : "La mascota quedó registrada.",
    )
  }

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="eyebrow">Perfiles</p>
          <h1>Mis mascotas</h1>
          <p className="lede">Cada perfil queda vinculado a su propio llavero NFC.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setForm(empty)
            setPhotos([])
            setErrors({})
            setOpen(true)
          }}
        >
          <PlusIcon />
          Registrar mascota
        </button>
      </header>

      {note ? (
        <p className="banner banner-ok" role="status">
          {note}
        </p>
      ) : null}

      {pets.length === 0 ? (
        <section className="panel empty-card">
          <h2>Aún no registras mascotas</h2>
          <p>Al guardar una, el servidor crea su ficha y un código NFC para el collar.</p>
        </section>
      ) : null}

      <div className="pet-grid">
        {pets.map((pet) => {
          const key = keys.find((item) => item.petId === pet.id)
          const lost = pet.status === "lost"
          return (
            <article className="mini-pet" key={pet.id}>
              {pet.photo ? (
                <img src={pet.photo} alt={pet.name} />
              ) : (
                <div className="mini-fallback" aria-hidden="true">
                  {initials(pet.name)}
                </div>
              )}
              <div>
                <span className={`badge${lost ? " badge-lost" : ""}`}>{lost ? "Extraviado" : "A salvo"}</span>
                <h2>{pet.name}</h2>
                <p>
                  {pet.species} · {pet.breed}
                </p>
                <p>
                  {pet.ageLabel} · {pet.weightLabel}
                </p>
                <p className="mini-code">{key ? `${key.code} · ${key.active ? "Activo" : "Inactivo"}` : "Sin llavero"}</p>
                {pet.photos?.length > 1 ? <p className="mini-code">{pet.photos.length} fotos</p> : null}
                <Link to={`/perfil/${pet.slug}`} className="text-link">
                  Ver perfil público
                </Link>
                <button type="button" className="btn btn-danger-text" onClick={() => setPendingDelete(pet)}>
                  Quitar
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {open ? (
        <Modal title="Registrar mascota" onClose={closeForm}>
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
                inputMode="numeric"
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
            <div className={`field${errors.photos ? " is-error" : ""}`}>
              <label htmlFor="pet-photos">Fotos</label>
              <div className="photo-picker">
                {photos.map((src, index) => (
                  <div className="photo-slot" key={`${index}-${src.slice(-24)}`}>
                    <img src={src} alt="" />
                    <button
                      type="button"
                      aria-label={`Quitar foto ${index + 1}`}
                      onClick={() => setPhotos((current) => current.filter((_, item) => item !== index))}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < 3 ? (
                  <label className="photo-add">
                    <input id="pet-photos" type="file" accept="image/*" multiple onChange={onPhotos} />
                    +
                  </label>
                ) : null}
              </div>
              {errors.photos ? (
                <p className="field-msg" role="alert">
                  {errors.photos}
                </p>
              ) : (
                <p className="field-hint">{photos.length} de 3 fotos. La primera es la principal.</p>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={closeForm}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Guardando…" : "Guardar mascota"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {pendingDelete ? (
        <Modal title={`Quitar a ${pendingDelete.name}`} onClose={() => setPendingDelete(null)}>
          <p>Se borran su ficha, sus cuidados y su llavero. El perfil público deja de existir.</p>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setPendingDelete(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                const result = await deletePet(pendingDelete.id)
                setNote(result.ok ? `Quitamos a ${pendingDelete.name}.` : result.message)
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
