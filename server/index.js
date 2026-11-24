import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import bcrypt from "bcryptjs"
import express from "express"
import jwt from "jsonwebtoken"
import { publicProfile, workspaceFor } from "./present.js"
import { careKind, db, save } from "./store.js"

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data")
const port = Number(process.env.PORT) || 8787

function secret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET
  fs.mkdirSync(dataDir, { recursive: true })
  const secretFile = path.join(dataDir, ".secret")
  if (fs.existsSync(secretFile)) return fs.readFileSync(secretFile, "utf8").trim()
  const value = crypto.randomBytes(32).toString("hex")
  fs.writeFileSync(secretFile, value)
  return value
}

function tokenFor(userId) {
  return jwt.sign({ sub: userId }, secret(), { expiresIn: "7d" })
}

function clean(value) {
  return String(value || "").trim().replace(/\s+/g, " ")
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean(value))
}

function normalizePhone(value) {
  let digits = String(value || "").replace(/\D/g, "")
  if (digits.startsWith("593") && digits.length === 12) digits = `0${digits.slice(3)}`
  return digits
}

function isValidPhone(value) {
  return /^09\d{8}$/.test(normalizePhone(value))
}

function nameIssue(value) {
  const name = clean(value)
  if (name.length < 3) return "Escribe tu nombre."
  if (!name.includes(" ")) return "Escribe tu nombre y tu apellido."
  if (name.length > 60) return "Ese nombre es demasiado largo."
  return ""
}

function passwordIssue(value) {
  const password = String(value || "")
  if (!password) return "Escribe una contraseña."
  if (password.length < 8) return "Usa al menos 8 caracteres."
  if (password.length > 64) return "Usa menos de 64 caracteres."
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(password) || !/\d/.test(password)) {
    return "Incluye letras y al menos un número."
  }
  return ""
}

function findUserByEmail(email) {
  const needle = clean(email).toLowerCase()
  return db().users.find((user) => user.email === needle) || null
}

function fail(res, status, field, message) {
  return res.status(status).json({ field, message })
}

function requireUser(req, res, next) {
  const header = req.get("authorization") || ""
  if (!header.startsWith("Bearer ")) {
    return fail(res, 401, "form", "Vuelve a iniciar sesión.")
  }
  try {
    const payload = jwt.verify(header.slice(7), secret())
    const user = db().users.find((item) => item.id === payload.sub)
    if (!user) return fail(res, 401, "form", "Vuelve a iniciar sesión.")
    req.user = user
    return next()
  } catch {
    return fail(res, 401, "form", "Tu sesión venció. Vuelve a entrar.")
  }
}

function ownPet(userId, petId) {
  return db().pets.find((pet) => pet.id === petId && pet.userId === userId) || null
}

function slugFor(name) {
  const base =
    clean(name)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "mascota"
  const taken = new Set(db().pets.map((pet) => pet.slug))
  let slug = base
  let n = 2
  while (taken.has(slug)) slug = `${base}-${n++}`
  return slug
}

function nfcCode() {
  return `NFC-${crypto.randomBytes(6).toString("hex").toUpperCase()}`
}

function storePhotos(list) {
  if (list == null || list.length === 0) return []
  if (!Array.isArray(list)) return { error: "Las fotos no son válidas." }
  if (list.length > 3) return { error: "Puedes subir hasta 3 fotos." }
  const ready = []
  for (const item of list) {
    const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(item || ""))
    if (!match) return { error: "Usa fotos en formato de imagen." }
    const bytes = Buffer.from(match[1], "base64")
    if (bytes.length < 100 || bytes.length > 1_600_000) return { error: "Cada foto debe ser más liviana." }
    ready.push(bytes)
  }
  fs.mkdirSync(uploadDir, { recursive: true })
  return ready.map((bytes) => {
    const name = `${crypto.randomUUID()}.jpg`
    fs.writeFileSync(path.join(uploadDir, name), bytes)
    return `/api/uploads/${name}`
  })
}

function removePhotos(pet) {
  const urls = [...(pet.photos || [])]
  if (pet.photo) urls.push(pet.photo)
  for (const url of urls) {
    const name = path.basename(String(url || ""))
    if (!/^[\w.-]+$/.test(name)) continue
    fs.rmSync(path.join(uploadDir, name), { force: true })
  }
}

function sendWorkspace(res, userId) {
  res.json(workspaceFor(db(), userId))
}

const app = express()
const uploadDir = path.join(dataDir, "uploads")
fs.mkdirSync(uploadDir, { recursive: true })
app.use("/api/uploads", express.static(uploadDir))
app.use(express.json({ limit: "8mb" }))

app.get("/api/health", (_req, res) => {
  res.json({ ok: true })
})

app.post("/api/auth/register", (req, res) => {
  const body = req.body || {}
  const issue = nameIssue(body.name)
  if (issue) return fail(res, 400, "name", issue)
  if (!isEmail(body.email)) return fail(res, 400, "email", "Escribe un correo válido.")
  if (!isValidPhone(body.phone)) {
    return fail(res, 400, "phone", "Usa un celular de Ecuador, por ejemplo 099 123 4567.")
  }
  const passwordError = passwordIssue(body.password)
  if (passwordError) return fail(res, 400, "password", passwordError)
  if (body.password !== body.confirm) return fail(res, 400, "confirm", "Las contraseñas no coinciden.")
  if (!body.accepted) return fail(res, 400, "accepted", "Acepta este punto para crear la cuenta.")
  const email = clean(body.email).toLowerCase()
  if (findUserByEmail(email)) return fail(res, 409, "email", "Ese correo ya tiene una cuenta. Inicia sesión.")

  const user = {
    id: crypto.randomUUID(),
    name: clean(body.name),
    email,
    phone: normalizePhone(body.phone),
    passwordHash: bcrypt.hashSync(String(body.password), 10),
    plan: "Plan gratuito",
    privacy: { showPhone: true, showForm: true },
  }
  db().users.push(user)
  save()
  res.status(201).json({ token: tokenFor(user.id), user: workspaceFor(db(), user.id).user })
})

app.post("/api/auth/login", (req, res) => {
  const body = req.body || {}
  const user = findUserByEmail(body.email)
  if (!user) return fail(res, 401, "email", "No encontramos una cuenta con ese correo.")
  if (!bcrypt.compareSync(String(body.password || ""), user.passwordHash)) {
    return fail(res, 401, "password", "La contraseña no coincide.")
  }
  res.json({ token: tokenFor(user.id), user: workspaceFor(db(), user.id).user })
})

app.post("/api/auth/lookup", (req, res) => {
  if (!isEmail(req.body?.email)) return fail(res, 400, "email", "Escribe un correo válido.")
  res.json({ exists: Boolean(findUserByEmail(req.body.email)) })
})

app.post("/api/auth/reset", (req, res) => {
  const body = req.body || {}
  const user = findUserByEmail(body.email)
  if (!user) return fail(res, 404, "email", "No encontramos una cuenta con ese correo.")
  const passwordError = passwordIssue(body.password)
  if (passwordError) return fail(res, 400, "password", passwordError)
  if (body.password !== body.confirm) return fail(res, 400, "confirm", "Las contraseñas no coinciden.")
  user.passwordHash = bcrypt.hashSync(String(body.password), 10)
  save()
  res.json({ ok: true })
})

app.get("/api/me", requireUser, (req, res) => {
  res.json({ user: workspaceFor(db(), req.user.id).user })
})

app.patch("/api/me", requireUser, (req, res) => {
  const issue = nameIssue(req.body?.name)
  if (issue) return fail(res, 400, "name", issue)
  if (!isValidPhone(req.body?.phone)) {
    return fail(res, 400, "phone", "Usa un celular de Ecuador, por ejemplo 099 123 4567.")
  }
  req.user.name = clean(req.body.name)
  req.user.phone = normalizePhone(req.body.phone)
  save()
  sendWorkspace(res, req.user.id)
})

app.patch("/api/me/privacy", requireUser, (req, res) => {
  const current = { showPhone: true, showForm: true, ...(req.user.privacy || {}) }
  if (typeof req.body?.showPhone === "boolean") current.showPhone = req.body.showPhone
  if (typeof req.body?.showForm === "boolean") current.showForm = req.body.showForm
  req.user.privacy = current
  save()
  sendWorkspace(res, req.user.id)
})

app.get("/api/workspace", requireUser, (req, res) => {
  sendWorkspace(res, req.user.id)
})

app.post("/api/pets", requireUser, (req, res) => {
  const body = req.body || {}
  const name = clean(body.name)
  const breed = clean(body.breed)
  const species = body.species === "Gato" ? "Gato" : body.species === "Perro" ? "Perro" : ""
  const age = Number(body.age)
  const weight = Number(String(body.weight ?? "").replace(",", "."))
  if (name.length < 2 || name.length > 40) return fail(res, 400, "name", "Escribe el nombre de la mascota.")
  if (!species) return fail(res, 400, "species", "Elige perro o gato.")
  if (!breed || breed.length > 40) return fail(res, 400, "breed", "Escribe la raza.")
  if (!Number.isInteger(age) || age < 0 || age > 30) return fail(res, 400, "age", "La edad va de 0 a 30 años.")
  if (Number.isNaN(weight) || weight < 0.2 || weight > 90) return fail(res, 400, "weight", "Revisa el peso en kilogramos.")
  const photos = storePhotos(body.photos)
  if (photos.error) return fail(res, 400, "photos", photos.error)

  const pet = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    name,
    species,
    breed,
    ageYears: age,
    weightKg: Math.round(weight * 10) / 10,
    photo: photos[0] || "",
    photos,
    status: "safe",
    slug: slugFor(name),
  }
  const key = {
    id: crypto.randomUUID(),
    petId: pet.id,
    userId: req.user.id,
    code: nfcCode(),
    active: true,
  }
  db().pets.push(pet)
  db().keys.push(key)
  save()
  res.status(201).json({ ...workspaceFor(db(), req.user.id), createdPetId: pet.id })
})

app.delete("/api/pets/:id", requireUser, (req, res) => {
  const pet = ownPet(req.user.id, req.params.id)
  if (!pet) return fail(res, 404, "form", "No encontramos esa mascota.")
  removePhotos(pet)
  const data = db()
  data.pets = data.pets.filter((item) => item.id !== pet.id)
  data.cares = data.cares.filter((item) => item.petId !== pet.id)
  data.keys = data.keys.filter((item) => item.petId !== pet.id)
  data.alerts = data.alerts.filter((item) => item.petId !== pet.id)
  save()
  sendWorkspace(res, req.user.id)
})

app.patch("/api/pets/:id/status", requireUser, (req, res) => {
  const pet = ownPet(req.user.id, req.params.id)
  if (!pet) return fail(res, 404, "form", "No encontramos esa mascota.")
  if (req.body?.status !== "safe" && req.body?.status !== "lost") {
    return fail(res, 400, "form", "El estado no es válido.")
  }
  pet.status = req.body.status
  save()
  sendWorkspace(res, req.user.id)
})

app.post("/api/cares", requireUser, (req, res) => {
  const body = req.body || {}
  const pet = ownPet(req.user.id, body.petId)
  if (!pet) return fail(res, 404, "form", "No encontramos esa mascota.")
  if (!careKind[body.type]) return fail(res, 400, "type", "Elige vacuna, cita o desparasitación.")
  const title = clean(body.title)
  const place = clean(body.place)
  if (title.length < 3 || title.length > 80) return fail(res, 400, "title", "Escribe el nombre del cuidado.")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date || "") || Number.isNaN(Date.parse(body.date))) {
    return fail(res, 400, "date", "Elige una fecha válida.")
  }
  if (place.length < 3 || place.length > 80) return fail(res, 400, "place", "Escribe el lugar o la persona responsable.")
  db().cares.push({
    id: crypto.randomUUID(),
    petId: pet.id,
    userId: req.user.id,
    type: body.type,
    title,
    date: body.date,
    place,
  })
  save()
  res.status(201)
  sendWorkspace(res, req.user.id)
})

app.patch("/api/keys/:id", requireUser, (req, res) => {
  const key = db().keys.find((item) => item.id === req.params.id && item.userId === req.user.id)
  if (!key) return fail(res, 404, "form", "No encontramos ese llavero.")
  if (typeof req.body?.active !== "boolean") return fail(res, 400, "form", "Indica si el llavero queda activo.")
  key.active = req.body.active
  save()
  sendWorkspace(res, req.user.id)
})

app.post("/api/alerts/read", requireUser, (req, res) => {
  for (const alert of db().alerts) {
    if (alert.userId === req.user.id) alert.read = true
  }
  save()
  sendWorkspace(res, req.user.id)
})

app.get("/api/public/:slug", (req, res) => {
  const profile = publicProfile(db(), String(req.params.slug || "").toLowerCase())
  if (!profile) return res.status(404).json({ field: "form", code: "not_found", message: "No hay una mascota con ese llavero." })
  res.json(profile)
})

app.post("/api/public/:slug/avisos", (req, res) => {
  const profile = publicProfile(db(), String(req.params.slug || "").toLowerCase())
  if (!profile) return res.status(404).json({ field: "form", code: "not_found", message: "No hay una mascota con ese llavero." })
  if (!profile.active) return fail(res, 409, "form", "Este llavero está desactivado.")
  if (!profile.showForm) return fail(res, 403, "form", "La dueña no recibe avisos por este formulario.")
  const name = clean(req.body?.name)
  const message = clean(req.body?.message)
  if (name.length < 2) return fail(res, 400, "name", "Escribe tu nombre para que la dueña sepa quién avisó.")
  if (message.length < 8) {
    return fail(res, 400, "message", "Cuéntale un poco más: dónde viste a la mascota y cómo contactarte.")
  }
  if (message.length > 400) return fail(res, 400, "message", "El mensaje es demasiado largo.")
  const pet = db().pets.find((item) => item.slug === profile.pet.slug)
  db().alerts.push({
    id: crypto.randomUUID(),
    userId: pet.userId,
    petId: pet.id,
    title: `${name} escribió sobre ${pet.name}`,
    meta: message,
    at: new Date().toISOString(),
    read: false,
  })
  save()
  res.status(201).json({ ok: true })
})

app.use((error, _req, res, next) => {
  if (res.headersSent) return next(error)
  if (error instanceof SyntaxError) {
    return fail(res, 400, "form", "El pedido no es válido.")
  }
  console.error(error)
  return fail(res, 500, "form", "El servidor no pudo completar la acción.")
})

app.listen(port, () => {
  db()
  console.log(`PetCare API en http://localhost:${port}`)
})
