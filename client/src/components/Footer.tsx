import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export function Footer() {
  const auth = useAuth()
  const currentYear = new Date().getFullYear()
  const isAuthenticated = !!auth.token

  return (
    <footer className="footer">
      <div className="footerContent">
        <div className="footerSection">
          <div className="footerBrand">
            <Link to="/" className="footerLogo">
              <img src="/imagenes/logo.png" alt="SportTown" width="40" height="40" />
              <span className="footerBrandText">SportTown</span>
            </Link>
            <p className="footerDescription">
              Tu destino para reservar instalaciones deportivas y participar en torneos. 
              Vive el deporte como nunca antes.
            </p>
          </div>
        </div>

        <div className="footerSection">
          <h4 className="footerTitle">Navegación</h4>
          <nav className="footerNav">
            <Link to="/instalaciones" className="footerLink">
              Instalaciones
            </Link>
            <Link to="/torneos" className="footerLink">
              Torneos
            </Link>
            <Link to="/" className="footerLink">
              Inicio
            </Link>
          </nav>
        </div>

        <div className="footerSection">
          <h4 className="footerTitle">Mi Cuenta</h4>
          <nav className="footerNav">
            {isAuthenticated ? (
              <>
                {auth.user?.is_admin ? (
                  <>
                    <Link to="/admin" className="footerLink">
                      Administración
                    </Link>
                    <Link to="/admin/torneos" className="footerLink">
                      Torneos
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/mis-reservas" className="footerLink">
                      Mis Reservas
                    </Link>
                    <Link to="/mis-torneos" className="footerLink">
                      Mis Torneos
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="footerLink">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="footerLink">
                  Crear Cuenta
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="footerSection">
          <h4 className="footerTitle">Contacto</h4>
          <div className="footerContact">
            <a href="mailto:info@sporttown.com" className="footerLink">
              info@sporttown.com
            </a>
            <a href="tel:+34900123456" className="footerLink">
              +34 900 123 456
            </a>
            <div className="footerSocial">
              <a
                href="https://twitter.com/sporttown"
                target="_blank"
                rel="noopener noreferrer"
                className="footerSocialLink"
                aria-label="Twitter"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/sporttown"
                target="_blank"
                rel="noopener noreferrer"
                className="footerSocialLink"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://facebook.com/sporttown"
                target="_blank"
                rel="noopener noreferrer"
                className="footerSocialLink"
                aria-label="Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footerBottom">
        <div className="footerBottomContent">
          <p className="footerCopyright">
            © {currentYear} SportTown. Todos los derechos reservados.
          </p>
          <div className="footerLegal">
            <Link to="/terminos" className="footerLegalLink">
              Términos y Condiciones
            </Link>
            <span className="footerSeparator">•</span>
            <Link to="/privacidad" className="footerLegalLink">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

