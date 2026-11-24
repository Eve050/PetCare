import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import bcrypt from "bcryptjs"

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data")
const file = path.join(dataDir, "db.json")

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

function seed() {
  const userId = "usr_evelyn"
  const petId = "pet_max"
  return {
    users: [
      {
        id: userId,
        name: "Evelyn Valverde",
        email: "evelyn@petcare.ec",
        phone: "0998123344",
        passwordHash: bcrypt.hashSync("Petcare2026", 10),
        plan: "Plan gratuito",
        privacy: { showPhone: true, showForm: true },
      },
    ],
    pets: [
      {
        id: petId,
        userId,
        name: "Max",
        species: "Perro",
        breed: "Golden retriever",
        ageYears: 3,
        weightKg: 28.4,
        photo: "/max.jpg",
        status: "safe",
        slug: "max",
      },
    ],
    cares: [
      {
        id: "care_vacuna",
        petId,
        userId,
        type: "vacuna",
        title: "Vacuna antirrábica",
        date: "2026-11-18",
        place: "Clínica Pañas · 10:30",
      },
      {
        id: "care_cita",
        petId,
        userId,
        type: "cita",
        title: "Control veterinario",
        date: "2026-11-24",
        place: "Dra. Violeta Torres · 18:00",
      },
      {
        id: "care_desp",
        petId,
        userId,
        type: "desparasitacion",
        title: "Desparasitación interna",
        date: "2026-12-02",
        place: "Desde el manual",
      },
    ],
    keys: [
      {
        id: "key_max",
        petId,
        userId,
        code: "NFC-7F3A9C2E18B4",
        active: true,
      },
    ],
    alerts: [],
  }
}

let cache = null

export function db() {
  if (cache) return cache
  fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(file)) {
    cache = seed()
    write()
    return cache
  }
  cache = JSON.parse(fs.readFileSync(file, "utf8"))
  return cache
}

function write() {
  fs.mkdirSync(dataDir, { recursive: true })
  const tmp = `${file}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2))
  fs.renameSync(tmp, file)
}

export function save() {
  write()
}

export function ageLabel(years) {
  return years === 1 ? "1 año" : `${years} años`
}

export function weightLabel(kg) {
  const n = Math.round(Number(kg) * 10) / 10
  return `${Number.isInteger(n) ? String(n) : n.toFixed(1)} kg`
}

export function formatCareDate(iso) {
  const [year, month, day] = iso.split("-").map(Number)
  return `${String(day).padStart(2, "0")} ${MONTHS[month - 1]}, ${year}`
}

export function shortDate(iso) {
  const [, month, day] = iso.split("-").map(Number)
  return `${day} ${MONTHS[month - 1]}`
}

export const careKind = {
  vacuna: "Vacuna",
  cita: "Cita",
  desparasitacion: "Desparasitación",
}

export const careTone = {
  vacuna: "mint",
  cita: "sand",
  desparasitacion: "peach",
}
