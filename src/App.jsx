import { Navigate, Route, Routes } from "react-router-dom"
import AppShell from "./components/AppShell.jsx"
import Cares from "./pages/Cares.jsx"
import ForgotPassword from "./pages/ForgotPassword.jsx"
import Home from "./pages/Home.jsx"
import Keys from "./pages/Keys.jsx"
import Login from "./pages/Login.jsx"
import Pets from "./pages/Pets.jsx"
import PublicProfile from "./pages/PublicProfile.jsx"
import Register from "./pages/Register.jsx"
import Settings from "./pages/Settings.jsx"
import { GuestOnly, RequireAuth } from "./routes/guards.jsx"

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/inicio" element={<Home />} />
          <Route path="/mascotas" element={<Pets />} />
          <Route path="/cuidados" element={<Cares />} />
          <Route path="/llaveros" element={<Keys />} />
          <Route path="/ajustes" element={<Settings />} />
        </Route>
      </Route>
      <Route path="/perfil/max" element={<PublicProfile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
