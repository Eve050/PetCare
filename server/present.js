import { ageLabel, careKind, careTone, formatCareDate, shortDate, weightLabel } from "./store.js"

function nextVisit(cares) {
  const citas = cares.filter((care) => care.type === "cita").sort((a, b) => a.date.localeCompare(b.date))
  if (citas.length === 0) return "Sin cita"
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = citas.find((care) => care.date >= today) || citas[citas.length - 1]
  return shortDate(upcoming.date)
}

export function presentUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    plan: user.plan,
  }
}

function presentCare(care) {
  return {
    id: care.id,
    petId: care.petId,
    type: care.type,
    kind: careKind[care.type],
    title: care.title,
    date: formatCareDate(care.date),
    dateISO: care.date,
    place: care.place,
    tone: careTone[care.type],
  }
}

export function workspaceFor(data, userId) {
  const user = data.users.find((item) => item.id === userId)
  const pets = data.pets.filter((pet) => pet.userId === userId)
  const cares = data.cares
    .filter((care) => care.userId === userId)
    .sort((a, b) => a.date.localeCompare(b.date))
  const keys = data.keys.filter((key) => key.userId === userId)
  const alerts = data.alerts
    .filter((alert) => alert.userId === userId)
    .sort((a, b) => b.at.localeCompare(a.at))

  return {
    user: {
      ...presentUser(user),
      privacy: { showPhone: true, showForm: true, ...user.privacy },
    },
    pets: pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      ageYears: pet.ageYears,
      ageLabel: ageLabel(pet.ageYears),
      weightKg: pet.weightKg,
      weightLabel: weightLabel(pet.weightKg),
      photo: pet.photo || pet.photos?.[0] || "",
      photos: pet.photos?.length ? pet.photos : pet.photo ? [pet.photo] : [],
      status: pet.status,
      slug: pet.slug,
      nextVisit: nextVisit(cares.filter((care) => care.petId === pet.id)),
    })),
    cares: cares.map(presentCare),
    keys: keys.map((key) => {
      const pet = pets.find((item) => item.id === key.petId)
      return {
        id: key.id,
        petId: key.petId,
        petName: pet?.name || "Mascota",
        code: key.code,
        active: key.active,
        slug: pet?.slug || "",
      }
    }),
    alerts: alerts.map((alert) => ({
      id: alert.id,
      petId: alert.petId,
      title: alert.title,
      meta: alert.meta,
      at: new Intl.DateTimeFormat("es-EC", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(alert.at)),
      read: Boolean(alert.read),
    })),
    unread: alerts.some((alert) => !alert.read),
  }
}

export function publicProfile(data, slug) {
  const pet = data.pets.find((item) => item.slug === slug)
  if (!pet) return null
  const user = data.users.find((item) => item.id === pet.userId)
  const key = data.keys.find((item) => item.petId === pet.id)
  if (!key?.active) {
    return { found: true, active: false, pet: { name: pet.name, slug: pet.slug } }
  }
  const privacy = { showPhone: true, showForm: true, ...(user?.privacy || {}) }
  return {
    found: true,
    active: true,
    pet: {
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      ageLabel: ageLabel(pet.ageYears),
      photo: pet.photo || pet.photos?.[0] || "",
      photos: pet.photos?.length ? pet.photos : pet.photo ? [pet.photo] : [],
      status: pet.status,
      slug: pet.slug,
    },
    ownerName: user?.name || "Su dueño",
    showPhone: privacy.showPhone,
    showForm: privacy.showForm,
    phone: privacy.showPhone ? user?.phone || "" : "",
  }
}
