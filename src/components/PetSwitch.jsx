import { useWorkspace } from "../context/useWorkspace.js"

export default function PetSwitch() {
  const { pets, pet, selectPet } = useWorkspace()
  if (pets.length < 2) return null
  return (
    <div className="pet-switch" role="tablist" aria-label="Elegir mascota">
      {pets.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`chip${item.id === pet?.id ? " active" : ""}`}
          aria-pressed={item.id === pet?.id}
          onClick={() => selectPet(item.id)}
        >
          {item.name}
        </button>
      ))}
    </div>
  )
}
