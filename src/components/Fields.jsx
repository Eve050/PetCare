import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "./Icons.jsx"

export function TextField({ id, label, error, hint, ...props }) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  return (
    <div className={`field${error ? " is-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
      />
      {error ? (
        <p className="field-msg" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function PasswordField({ id, label, error, hint, ...props }) {
  const [visible, setVisible] = useState(false)
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  return (
    <div className={`field${error ? " is-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
        />
        <button
          type="button"
          className="input-toggle"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error ? (
        <p className="field-msg" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
