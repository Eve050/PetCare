import Logo from "./Logo.jsx"

export default function AuthLayout({ children }) {
  return (
    <div className="gate">
      <a className="skip" href="#contenido">
        Saltar al formulario
      </a>
      <div className="gate-card">
        <section className="gate-art">
          <img className="gate-scene" src="/login-pets.png?v=2" alt="Un perro y un gato con collar" />
          <Logo />
          <svg className="gate-curve" viewBox="0 0 120 640" preserveAspectRatio="none" aria-hidden="true">
            <path
              fill="#ffffff"
              d="M0 0h62c-36 78 48 132-8 214-52 78 58 132-6 214-46 62 40 120-8 212H0Z"
            />
          </svg>
        </section>
        <main className="gate-form" id="contenido">
          {children}
        </main>
      </div>
    </div>
  )
}
