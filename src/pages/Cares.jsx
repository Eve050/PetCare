import { useMemo, useState } from "react"
import { careIcons } from "../components/careIcons.js"
import { cares } from "../data/example.js"
import { useTitle } from "../lib/useTitle.js"

const filters = [
  { id: "todos", label: "Todos" },
  { id: "vacuna", label: "Vacunas" },
  { id: "cita", label: "Citas" },
  { id: "desparasitacion", label: "Desparasitación" },
]

export default function Cares() {
  const [filter, setFilter] = useState("todos")
  useTitle("Cuidados")
  const visible = useMemo(
    () => (filter === "todos" ? cares : cares.filter((care) => care.type === filter)),
    [filter],
  )

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="eyebrow">Agenda</p>
          <h1>Cuidados de Max</h1>
          <p className="lede">Vacunas, citas y desparasitación con las fechas de ejemplo del proyecto.</p>
        </div>
      </header>
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
      {visible.length === 0 ? <p className="lede">No hay cuidados de ese tipo en el ejemplo.</p> : null}
    </div>
  )
}
