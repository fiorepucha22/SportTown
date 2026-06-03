import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export function Register() {
  const auth = useAuth()
  const nav = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await auth.register(name, email, password)
      nav('/instalaciones', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error registrando usuario')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="centerWrap">
      <div className="panel">
        <h2 className="pageTitle">Crear cuenta</h2>
        <p className="pageSubtitle">Regístrate para reservar y gestionar tus reservas.</p>

        {error ? <div className="alert alertError">{error}</div> : null}

        <form onSubmit={onSubmit} className="form">
          <div className="field">
            <label className="label" htmlFor="name">
              Nombre
            </label>
            <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

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
            <input
              id="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          <button className="btn btnPrimary" type="submit" disabled={saving || auth.loading}>
            {saving ? 'Creando…' : 'Crear cuenta'}
          </button>
        </form>

        <div className="muted">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  )
}


