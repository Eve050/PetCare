import { useCallback, useEffect, useMemo, useState } from "react"
import { WorkspaceContext } from "./workspace-context.js"
import { api } from "../lib/api.js"

const SELECTED = "petcare.pet"

function readSelected() {
  try {
    return sessionStorage.getItem(SELECTED) || ""
  } catch {
    return ""
  }
}

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(null)
  const [error, setError] = useState("")
  const [selectedId, setSelectedId] = useState(readSelected)

  const pull = useCallback(async () => {
    const result = await api.workspace()
    if (!result.ok) {
      setError(result.message)
      return result
    }
    setWorkspace(result.data)
    setError("")
    return result
  }, [])

  useEffect(() => {
    let alive = true
    async function first() {
      const result = await api.workspace()
      if (!alive) return
      if (result.ok) {
        setWorkspace(result.data)
        setError("")
      } else {
        setError(result.message)
      }
    }
    first()
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") pull()
    }, 10000)
    window.addEventListener("focus", pull)
    return () => {
      alive = false
      window.clearInterval(timer)
      window.removeEventListener("focus", pull)
    }
  }, [pull])

  const selectPet = useCallback((id) => {
    setSelectedId(id)
    try {
      if (id) sessionStorage.setItem(SELECTED, id)
      else sessionStorage.removeItem(SELECTED)
    } catch {
      // La elección sigue en esta visita.
    }
  }, [])

  const apply = useCallback(async (action) => {
    const result = await action()
    if (result.ok) {
      setWorkspace(result.data)
      setError("")
    }
    return result
  }, [])

  const pet = useMemo(() => {
    const pets = workspace?.pets || []
    return pets.find((item) => item.id === selectedId) || pets[0] || null
  }, [workspace, selectedId])

  const cares = useMemo(
    () => (workspace?.cares || []).filter((care) => care.petId === pet?.id),
    [workspace, pet],
  )

  const key = useMemo(
    () => (workspace?.keys || []).find((item) => item.petId === pet?.id) || null,
    [workspace, pet],
  )

  const value = useMemo(() => {
    if (!workspace) return null
    return {
      user: workspace.user,
      pets: workspace.pets,
      cares,
      allCares: workspace.cares,
      keys: workspace.keys,
      alerts: workspace.alerts,
      unread: workspace.unread,
      pet,
      key,
      privacy: workspace.user.privacy,
      selectPet,
      setStatus: (status) => apply(() => api.setStatus(pet.id, status)),
      setKeyActive: (id, active) => apply(() => api.setKey(id, active)),
      setPrivacy: (partial) => apply(() => api.privacy(partial)),
      createPet: async (body) => {
        const result = await apply(() => api.createPet(body))
        if (result.ok && result.data.createdPetId) selectPet(result.data.createdPetId)
        return result
      },
      deletePet: (id) => apply(() => api.deletePet(id)),
      createCare: (body) => apply(() => api.createCare(body)),
      markAlertsRead: () => apply(() => api.markAlertsRead()),
    }
  }, [workspace, cares, pet, key, selectPet, apply])

  if (error && !workspace) {
    return (
      <div className="boot" role="alert">
        <p>{error}</p>
      </div>
    )
  }

  if (!value) {
    return (
      <div className="boot" role="status">
        <p>Cargando tu panel…</p>
      </div>
    )
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
