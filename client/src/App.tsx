import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Instalaciones } from './pages/Instalaciones'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Reserva } from './pages/Reserva'
import { NotFound } from './pages/NotFound'
import { Torneos } from './pages/Torneos'
import { MisReservas } from './pages/MisReservas'
import { MisTorneos } from './pages/MisTorneos'
import { Admin } from './pages/Admin'
import { AdminTorneos } from './pages/AdminTorneos'
import { HacerseSocio } from './pages/HacerseSocio'

export default function App() {
  return (
    <div className="appShell">
      <Navbar />

      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/instalaciones" element={<Instalaciones />} />
          <Route path="/torneos" element={<Torneos />} />
          <Route path="/mis-reservas" element={<MisReservas />} />
          <Route path="/mis-torneos" element={<MisTorneos />} />
          <Route path="/hacerse-socio" element={<HacerseSocio />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/torneos" element={<AdminTorneos />} />
          <Route path="/reservar/:id" element={<Reserva />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
