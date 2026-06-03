// Barra de navegación principal con logo, enlaces, menú de perfil y gestión de autenticación
// Muestra diferentes opciones según el rol del usuario (admin/usuario) y estado de autenticación
import { Link, NavLink } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { MaterialIcon } from './MaterialIcon'

export function Navbar() {
  const auth = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    function onPointerDown(e: MouseEvent | PointerEvent) {
      const el = menuRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  const profile = useMemo(() => {
    const name = auth.user?.name || 'Usuario'
    const email = auth.user?.email || ''
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('')
    return { name, email, initials: initials || 'U' }
  }, [auth.user])

  return (
    <header className="navWrap">
      <div className="nav">
        <Link className="brand" to="/" aria-label="SportTown">
          <span className="brandMark" aria-hidden="true">
            <img src="/imagenes/logo.png" alt="SportTown" width="36" height="36" />
          </span>
          <span className="brandText">SportTown</span>
        </Link>

        <nav className="navLinks" aria-label="Navegación principal">
          <NavLink className="navLink" to="/instalaciones">
            <span className="navIcon" aria-hidden="true">
              {iconFacility}
            </span>
            Instalaciones
          </NavLink>

          <NavLink className="navLink" to="/torneos">
            <span className="navIcon" aria-hidden="true">
              {iconTrophy}
            </span>
            Torneos
          </NavLink>

          {auth.token && !auth.user?.is_admin && (
            <NavLink className="navLink" to="/hacerse-socio">
              <span className="navIcon" aria-hidden="true">
                <MaterialIcon name={auth.user?.es_socio && auth.user?.fecha_fin_socio && new Date(auth.user.fecha_fin_socio) >= new Date() ? 'star' : 'star_border'} style={{ fontSize: '18px' }} />
              </span>
              {auth.user?.es_socio && auth.user?.fecha_fin_socio && new Date(auth.user.fecha_fin_socio) >= new Date() ? 'Socio' : 'Hacerse Socio'}
            </NavLink>
          )}
        </nav>

        <div className="navActions">
          {!auth.token ? (
            <NavLink className="navLink" to="/login">
              <span className="navIcon" aria-hidden="true">
                {iconLogin}
              </span>
              Iniciar sesión
            </NavLink>
          ) : (
            <div className="profileWrap" ref={menuRef}>
              <button
                className="profileButton"
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
              >
                <span className="avatar" aria-hidden="true">
                  {profile.initials}
                </span>
                <span className="profileMeta">
                  <span className="profileName">{profile.name}</span>
                  {profile.email ? <span className="profileEmail">{profile.email}</span> : null}
                </span>
                <span className="chev" aria-hidden="true">
                  {iconChevron}
                </span>
              </button>

              {open ? (
                <div className="menu" role="menu" aria-label="Perfil">
                  <div className="menuHeader">
                    <div className="menuTitle">{profile.name}</div>
                    {profile.email ? <div className="menuSub">{profile.email}</div> : null}
                  </div>

                  <div className="menuItems">
                    {auth.user?.is_admin ? (
                      <>
                        <Link className="menuItem" to="/admin" role="menuitem" onClick={() => setOpen(false)}>
                          <MaterialIcon name="bar_chart" style={{ fontSize: '18px' }} />
                          Administración
                        </Link>
                        <Link className="menuItem" to="/admin/torneos" role="menuitem" onClick={() => setOpen(false)}>
                          <MaterialIcon name="emoji_events" style={{ fontSize: '18px' }} />
                          Inscripciones Torneos
                        </Link>
                        <Link className="menuItem" to="/admin/gestion-torneos" role="menuitem" onClick={() => setOpen(false)}>
                          <MaterialIcon name="edit" style={{ fontSize: '18px' }} />
                          Gestionar Torneos
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link className="menuItem" to="/mis-torneos" role="menuitem" onClick={() => setOpen(false)}>
                          {iconTrophy}
                          Mis torneos
                        </Link>
                        <Link className="menuItem" to="/mis-reservas" role="menuitem" onClick={() => setOpen(false)}>
                          {iconCalendar}
                          Mis reservas
                        </Link>
                      </>
                    )}

                    <button
                      className="menuItem danger"
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpen(false)
                        void auth.logout()
                      }}
                    >
                      {iconLogout}
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


const iconFacility = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 20V6a2 2 0 0 1 2-2h6v16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M12 20V10h6a2 2 0 0 1 2 2v8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M8 7h1M8 10h1M8 13h1M8 16h1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const iconLogin = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M3 12h10M8 7l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const iconTrophy = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 4h8v2a4 4 0 0 1-8 0V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M10 14h4M12 14v4M9 22h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path
      d="M6 6H4.5A1.5 1.5 0 0 0 3 7.5V9a4 4 0 0 0 4 4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M18 6h1.5A1.5 1.5 0 0 1 21 7.5V9a4 4 0 0 1-4 4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const iconChevron = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const iconLogout = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path d="M3 12h10M8 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const iconCalendar = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 3v3M16 3v3M4.5 9.5h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path
      d="M6.5 6h11A2.5 2.5 0 0 1 20 8.5v11A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-11A2.5 2.5 0 0 1 6.5 6Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
)


