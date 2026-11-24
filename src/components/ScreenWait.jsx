export default function ScreenWait({ label = "Cargando PetCare…" }) {
  return (
    <div className="boot" role="status">
      <p>{label}</p>
    </div>
  )
}
