import { Link } from "react-router-dom"
import { Paw } from "./Icons.jsx"

export default function Logo({ to = "/", className = "" }) {
  return (
    <Link to={to} className={`logo ${className}`.trim()}>
      <span className="logo-mark">
        <Paw />
      </span>
      <span className="logo-word">petcare</span>
    </Link>
  )
}
