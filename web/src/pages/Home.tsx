// Página de inicio con hero section y tarjetas de características principales
// Muestra botones de acción diferentes según el estado de autenticación del usuario
import { FeatureCard } from '../components/FeatureCard'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export function Home() {
  const auth = useAuth()
  return (
    <>
      <section className="heroWrap">
        <div className="heroCard">
          <div className="heroGlow" aria-hidden="true" />
          <div className="heroInner">
            <h1 className="heroTitle">SportTown</h1>
            <p className="heroSubtitle">
              Reserva tus instalaciones favoritas, participa en torneos y disfruta de todas las ventajas de
              ser socio del centro deportivo.
            </p>

            <div className="heroActions">
              {!auth.token ? (
                <>
                  <Link className="btn btnPrimary" to="/register">
                    <span className="btnIcon" aria-hidden="true">
                      {iconUserPlus}
                    </span>
                    Crear cuenta
                  </Link>
                  <Link className="btn btnGhost" to="/login">
                    <span className="btnIcon" aria-hidden="true">
                      {iconLogin}
                    </span>
                    Iniciar sesión
                  </Link>
                </>
              ) : (
                <>
                  <Link className="btn btnPrimary" to="/instalaciones">
                    <span className="btnIcon" aria-hidden="true">
                      {iconCalendar}
                    </span>
                    Ver instalaciones
                  </Link>
                  <Link className="btn btnGhost" to="/torneos">
                    <span className="btnIcon" aria-hidden="true">
                      {iconTrophy}
                    </span>
                    Ver torneos
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <FeatureCard
          title="Reserva Instalaciones"
          description="Reserva pistas de tenis, pádel, fútbol sala y más. Consulta disponibilidad y precio al instante."
          icon={iconCalendar}
          stagger={0}
        />
        <FeatureCard
          title="Participa en Torneos"
          description="Compite en torneos de la Comunidad Valenciana. Inscríbete y consulta fechas, sedes y plazas."
          icon={iconTrophy}
          stagger={1}
        />
        <FeatureCard
          title="Hazte Socio"
          description="Accede a ventajas exclusivas: descuentos, prioridad en torneos y acceso a instalaciones restringidas."
          icon={iconUsers}
          stagger={2}
        />
      </section>
    </>
  )
}

const iconCalendar = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 3v3M16 3v3M4.5 9.5h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path
      d="M6.5 6h11A2.5 2.5 0 0 1 20 8.5v11A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-11A2.5 2.5 0 0 1 6.5 6Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M7.5 13h3M13.5 13h3M7.5 17h3M13.5 17h3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const iconTrophy = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M8 4h8v2a4 4 0 0 1-8 0V4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
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

const iconUsers = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M16.5 21v-1.2a4.3 4.3 0 0 0-4.3-4.3H7.8A4.3 4.3 0 0 0 3.5 19.8V21"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path d="M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M20.5 21v-1.2a3.6 3.6 0 0 0-2.6-3.45" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16 4.4a3.9 3.9 0 0 1 0 7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const iconUserPlus = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M15 21v-1.2a4.3 4.3 0 0 0-4.3-4.3H7.8A4.3 4.3 0 0 0 3.5 19.8V21"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path d="M9.3 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M19 8v6M16 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const iconLogin = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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


