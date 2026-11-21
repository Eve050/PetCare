import Logo from "./Logo.jsx"

function PetScene() {
  return (
    <svg className="gate-scene" viewBox="0 0 460 430" role="img" aria-label="Ilustración de un golden retriever con llavero NFC">
      <ellipse cx="214" cy="228" rx="156" ry="132" fill="#d7efe3" />
      <ellipse cx="132" cy="196" rx="78" ry="66" fill="#c6e6d6" />
      <ellipse cx="292" cy="286" rx="72" ry="58" fill="#eef8f3" />
      <circle cx="78" cy="92" r="9" fill="#d5ebe1" />
      <circle cx="372" cy="118" r="14" fill="#e5f4ec" />
      <circle cx="64" cy="292" r="6" fill="#b7dcc9" />
      <circle cx="390" cy="330" r="8" fill="#d3eadf" />
      <circle cx="338" cy="78" r="5" fill="#f2c14e" />

      <ellipse cx="228" cy="372" rx="86" ry="12" fill="#b7d4c4" opacity="0.75" />

      <path
        d="M312 268c36-18 62 8 52 42"
        fill="none"
        stroke="#e2b15c"
        strokeWidth="18"
        strokeLinecap="round"
      />

      <ellipse cx="236" cy="292" rx="86" ry="62" fill="#f0c56e" />
      <ellipse cx="214" cy="312" rx="40" ry="34" fill="#f8e7c2" />
      <ellipse cx="286" cy="336" rx="20" ry="30" fill="#e2b15a" />
      <rect x="186" y="318" width="24" height="48" rx="12" fill="#f0c56e" />
      <rect x="214" y="324" width="24" height="44" rx="12" fill="#e8bc62" />
      <ellipse cx="198" cy="366" rx="15" ry="8" fill="#f7e4c4" />
      <ellipse cx="226" cy="368" rx="15" ry="8" fill="#f7e4c4" />

      <ellipse cx="150" cy="214" rx="20" ry="36" fill="#d89a45" transform="rotate(-24 150 214)" />
      <ellipse cx="236" cy="188" rx="18" ry="30" fill="#e2aa52" transform="rotate(16 236 188)" />
      <circle cx="196" cy="214" r="56" fill="#f3cc78" />
      <ellipse cx="168" cy="236" rx="28" ry="20" fill="#f8e7c4" />
      <ellipse cx="156" cy="232" rx="7.5" ry="5.5" fill="#3c342e" />
      <circle cx="206" cy="206" r="6" fill="#2c2824" />
      <circle cx="208" cy="204" r="1.8" fill="#fff" />
      <path d="M160 246c10 10 24 10 34 1" fill="none" stroke="#c9843a" strokeWidth="2.2" strokeLinecap="round" />

      <path d="M166 258c22 16 52 14 74-4" fill="none" stroke="#1e7a46" strokeWidth="9" strokeLinecap="round" />
      <rect x="214" y="252" width="26" height="32" rx="7" fill="#f7fbf8" stroke="#156038" strokeWidth="1.6" />
      <path d="M221 264c5-3.2 10-3.2 15 0" fill="none" stroke="#1e7a46" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M222 270c3.6-2.4 8-2.4 12 0" fill="none" stroke="#1e7a46" strokeWidth="1.6" strokeLinecap="round" />

      <path d="M332 150l5 10 10 5-10 5-5 10-5-10-10-5 10-5z" fill="#f2c14e" />
      <path d="M96 168l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#8fd0b8" />
    </svg>
  )
}

export default function AuthLayout({ children }) {
  return (
    <div className="gate">
      <a className="skip" href="#contenido">
        Saltar al formulario
      </a>
      <span className="gate-orb gate-orb-a" />
      <span className="gate-orb gate-orb-b" />
      <span className="gate-orb gate-orb-c" />
      <span className="gate-orb gate-orb-d" />
      <div className="gate-card">
        <section className="gate-art">
          <Logo />
          <PetScene />
          <p className="gate-note">Prototipo académico · Loja, Ecuador</p>
          <svg className="gate-curve" viewBox="0 0 120 640" preserveAspectRatio="none" aria-hidden="true">
            <path
              fill="#f7fbf8"
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
