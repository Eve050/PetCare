import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { TextField } from "../components/Fields.jsx"
import Modal from "../components/Modal.jsx"
import PetSwitch from "../components/PetSwitch.jsx"
import { PlusIcon } from "../components/Icons.jsx"
import { careIcons } from "../components/careIcons.js"
import { useWorkspace } from "../context/useWorkspace.js"
import { useTitle } from "../lib/useTitle.js"

const filters = [
  { id: "todos", label: "Todos" },
  { id: "vacuna", label: "Vacunas" },
  { id: "cita", label: "Citas" },
  { id: "desparasitacion", label: "Desparasitación" },
]

const empty = { type: "vacuna", title: "", date: "", place: "" }

export default function Cares() {
  const { pet, cares, createCare } = useWorkspace()
  const [filter, setFilter] = useState("todos")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  useTitle("Cuidados")

  const visible = useMemo(
    () => (filter === "todos" ? cares : cares.filter((care) => care.type === filter)),
    [cares, filter],
  )

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function onCreate(event) {
    event.preventDefault()
    const next = {}
    if (form.title.trim().length < 3) next.title = "Escribe el nombre del cuidado."
    if (!form.date) next.date = "Elige una fecha."
    if (form.place.trim().length < 3) next.place = "Escribe el lugar o la persona responsable."
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setSaving(true)
    const result = await createCare({
      petId: pet.id,
      type: form.type,
      title: form.title,
      date: form.date,
      place: form.place,
    })
    setSaving(false)
    if (!result.ok) {
      setErrors({ [result.field]: result.message })
      return
    }
    setForm(empty)
    setOpen(false)
    setNote(`Guardamos el cuidado de ${pet.name}.`)
  }

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="eyebrow">Agenda</p>
          <h1>{pet ? `Cuidados de ${pet.name}` : "Cuidados"}</h1>
          <p className="lede">Vacunas, citas y desparasitación. Estas fechas no se publican en el perfil del llavero.</p>
        </div>
        {pet ? (
          <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
            <PlusIcon />
            Añadir cuidado
          </button>
        ) : null}
      </header>

      <PetSwitch />

      {note ? (
        <p className="banner banner-ok" role="status">
          {note}
        </p>
      ) : null}

      {pet ? (
        <>
          <div className="filters" role="tablist" aria-label="Filtrar cuidados">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`chip${filter === item.id ? " active" : ""}`}
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="care-grid">
            {visible.map((care) => {
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
          {visible.length === 0 ? <p className="lede">No hay cuidados de ese tipo para {pet.name}.</p> : null}
        </>
      ) : (
        <section className="panel empty-card">
          <h2>Primero registra una mascota</h2>
          <p>Los cuidados se guardan en la ficha de un perro o un gato.</p>
          <Link to="/mascotas" className="btn btn-primary">
            Ir a mis mascotas
          </Link>
        </section>
      )}

      {open && pet ? (
        <Modal title={`Añadir cuidado de ${pet.name}`} onClose={() => setOpen(false)}>
          <form onSubmit={onCreate} noValidate className="stack-form">
            <div className="field">
              <label htmlFor="care-type">Tipo</label>
              <select id="care-type" value={form.type} onChange={(event) => setField("type", event.target.value)}>
                <option value="vacuna">Vacuna</option>
                <option value="cita">Cita</option>
                <option value="desparasitacion">Desparasitación</option>
              </select>
            </div>
            <TextField
              id="care-title"
              label="Nombre"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              error={errors.title}
              placeholder="Vacuna antirrábica"
            />
            <TextField
              id="care-date"
              label="Fecha"
              type="date"
              value={form.date}
              onChange={(event) => setField("date", event.target.value)}
              error={errors.date}
            />
            <TextField
              id="care-place"
              label="Lugar o responsable"
              value={form.place}
              onChange={(event) => setField("place", event.target.value)}
              error={errors.place}
              placeholder="Clínica Pañas · 10:30"
            />
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Guardando…" : "Guardar cuidado"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  )
}
