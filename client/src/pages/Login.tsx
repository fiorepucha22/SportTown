// Página de inicio de sesión con formulario de email y contraseña
// Redirige al usuario a la página desde la que fue enviado después del login
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export function Login() {
  const auth = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const returnTo = (location.state as any)?.returnTo || '/instalaciones'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await auth.login(email, password)
      nav(returnTo, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error iniciando sesión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="centerWrap">
      <div className="panel">
        <h2 className="pageTitle">Iniciar sesión</h2>
        <p className="pageSubtitle">Accede para reservar instalaciones.</p>

        {error ? <div className="alert alertError">{error}</div> : null}

        <form onSubmit={onSubmit} className="form">
          <div className="field">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="password">
              Contraseña
            </label>
            <div className="inputWrap">
              <input
                id="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="inputToggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? iconEyeOff : iconEye}
              </button>
            </div>
          </div>

          <button className="btn btnPrimary" type="submit" disabled={saving || auth.loading}>
            {saving ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="muted">
          ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
        </div>
      </div>
    </div>
  )
}

const iconEye = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
  </svg>
)

const iconEyeOff = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)


