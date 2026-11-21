function Icon({ size = 20, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function Paw({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="16.5" rx="4.15" ry="3.15" fill="currentColor" />
      <circle cx="7.15" cy="10.15" r="1.7" fill="currentColor" />
      <circle cx="10.95" cy="7.45" r="1.75" fill="currentColor" />
      <circle cx="15.05" cy="7.7" r="1.75" fill="currentColor" />
      <circle cx="18.35" cy="10.75" r="1.55" fill="currentColor" />
    </svg>
  )
}

export function HomeIcon() {
  return (
    <Icon>
      <path d="M4 10.6 12 4l8 6.6" />
      <path d="M6.5 10v9.2h11V10" />
    </Icon>
  )
}

export function PetIcon() {
  return (
    <Icon>
      <circle cx="8" cy="9" r="1.6" />
      <circle cx="12" cy="7.2" r="1.6" />
      <circle cx="16" cy="9" r="1.6" />
      <path d="M7.2 14.2c.7 2.4 2.5 3.8 4.8 3.8s4.1-1.4 4.8-3.8c.3-1.1-.5-2.2-1.6-2.2-.8 0-1.4.4-1.8 1-.5.7-1.2 1-1.4 1s-.9-.3-1.4-1c-.4-.6-1-1-1.8-1-1.1 0-1.9 1.1-1.6 2.2z" />
    </Icon>
  )
}

export function CareIcon() {
  return (
    <Icon>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" />
    </Icon>
  )
}

export function NfcIcon() {
  return (
    <Icon>
      <rect x="8" y="7" width="8" height="10" rx="2" />
      <path d="M5 9.5a5.5 5.5 0 0 0 0 5" />
      <path d="M19 9.5a5.5 5.5 0 0 1 0 5" />
    </Icon>
  )
}

export function SettingsIcon() {
  return (
    <Icon>
      <path d="M4 8h16M4 16h16" />
      <circle cx="9" cy="8" r="2.1" />
      <circle cx="15" cy="16" r="2.1" />
    </Icon>
  )
}

export function LogoutIcon() {
  return (
    <Icon>
      <path d="M10 7V5H5v14h5v-2" />
      <path d="M10 12h9" />
      <path d="m16 9 3 3-3 3" />
    </Icon>
  )
}

export function BellIcon() {
  return (
    <Icon>
      <path d="M6.5 16V11a5.5 5.5 0 0 1 11 0v5" />
      <path d="M5 16.5h14" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </Icon>
  )
}

export function EyeIcon() {
  return (
    <Icon>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.4" />
    </Icon>
  )
}

export function EyeOffIcon() {
  return (
    <Icon>
      <path d="M4 5.5 19 19" />
      <path d="M9.2 6.6A10 10 0 0 1 12 6.2c6 0 9.5 5.8 9.5 5.8a17 17 0 0 1-3.4 3.9" />
      <path d="M6.4 7.6C4 9.2 2.5 12 2.5 12S6 17.8 12 17.8c1.2 0 2.3-.2 3.3-.6" />
    </Icon>
  )
}

export function ShieldIcon() {
  return (
    <Icon>
      <path d="M12 3.5 5.5 6.2v5.6c0 4 2.6 6.8 6.5 8.7 3.9-1.9 6.5-4.7 6.5-8.7V6.2L12 3.5z" />
    </Icon>
  )
}

export function ChevronIcon() {
  return (
    <Icon size={16}>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  )
}

export function MenuIcon() {
  return (
    <Icon>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  )
}

export function CheckIcon() {
  return (
    <Icon size={16}>
      <path d="m5 12 5 5L20 7" />
    </Icon>
  )
}

export function SyringeIcon() {
  return (
    <Icon>
      <path d="m15 5 4 4" />
      <path d="m16.5 6.5-9 9" />
      <path d="m5.5 15.5-1.5 1.5 3 3 1.5-1.5" />
      <path d="m9 13 2 2" />
    </Icon>
  )
}

export function CalendarIcon() {
  return (
    <Icon>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" />
      <path d="M9 14h.01M12 14h.01M15 14h.01M9 17h.01" />
    </Icon>
  )
}

export function DropIcon() {
  return (
    <Icon>
      <path d="M12 3.5s6 6.4 6 10.2a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5z" />
    </Icon>
  )
}

export function PlusIcon() {
  return (
    <Icon>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  )
}
