import { useSyncExternalStore } from "react"

const KEY = "petcare.state.v1"

const base = {
  petStatus: "safe",
  keyActive: true,
  privacy: {
    showPhone: true,
    showForm: true,
  },
  extraPets: [],
  alerts: [],
  unread: false,
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(base)
    const parsed = JSON.parse(raw)
    return {
      ...base,
      ...parsed,
      privacy: { ...base.privacy, ...(parsed.privacy || {}) },
      extraPets: Array.isArray(parsed.extraPets) ? parsed.extraPets : [],
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
      unread: Boolean(parsed.unread),
    }
  } catch {
    return structuredClone(base)
  }
}

let state = load()
const listeners = new Set()

function commit(next) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Si la cuota se llena, el cambio sigue viéndose en esta visita.
  }
  listeners.forEach((listener) => listener())
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot() {
  return state
}

export function usePrototype() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function setPetStatus(petStatus) {
  commit({ ...state, petStatus })
}

export function setKeyActive(keyActive) {
  commit({ ...state, keyActive })
}

export function setPrivacy(partial) {
  commit({ ...state, privacy: { ...state.privacy, ...partial } })
}

export function addPet(pet) {
  commit({ ...state, extraPets: [pet, ...state.extraPets] })
}

export function removePet(id) {
  commit({ ...state, extraPets: state.extraPets.filter((pet) => pet.id !== id) })
}

export function addAlert(alert) {
  commit({ ...state, alerts: [alert, ...state.alerts], unread: true })
}

export function markAlertsRead() {
  if (!state.unread) return
  commit({ ...state, unread: false })
}
