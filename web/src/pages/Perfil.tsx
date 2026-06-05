import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { validarPasswordSegura } from '../lib/auth'
import { MessageModal } from '../components/MessageModal'

export function Perfil() {
  const auth = useAuth()
  const nav = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [messageModal, setMessageModal] = useState<{ open: boolean; type: 'success' | 'error'; title: string; message: string }>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  })

  useEffect(() => {
    if (!auth.token && !auth.loading) {
      nav('/login', { state: { returnTo: '/perfil' }, replace: true })
    }
  }, [auth.token, auth.loading, nav])

  useEffect(() => {
    if (auth.user) {
      setName(auth.user.name || '')
      setEmail(auth.user.email || '')
    }
  }, [auth.user])

  const passwordError = password.length > 0 ? validarPasswordSegura(password) : null

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const quiereCambiarPassword = password.length > 0 || passwordConfirm.length > 0 || currentPassword.length > 0

    if (quiereCambiarPassword) {
      if (!currentPassword) {
        setError('Introduce tu contraseña actual para cambiarla.')
        return
      }
      const errPwd = validarPasswordSegura(password)
      if (errPwd) {
        setError(errPwd)
        return
      }
      if (password !== passwordConfirm) {
        setError('La nueva contraseña y su confirmación no coinciden.')
        return
      }
    }

    setSaving(true)
    try {
      await auth.updateProfile({
        name,
        email,
        ...(quiereCambiarPassword ? { current_password: currentPassword, password } : {}),
      })
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirm('')
      setMessageModal({
        open: true,
        type: 'success',
        title: 'Perfil actualizado',
        message: 'Tus datos se han guardado correctamente.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando el perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="centerWrap">
      <div className="panel" style={{ maxWidth: '560px' }}>
        <h2 className="pageTitle">Editar perfil</h2>
        <p className="pageSubtitle">Actualiza tu nombre, correo y contraseña.</p>

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

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0 4px' }} />
          <p className="muted" style={{ margin: 0 }}>
            Cambiar contraseña (déjalo en blanco si no quieres cambiarla)
          </p>

          <div className="field">
            <label className="label" htmlFor="current_password">
              Contraseña actual
            </label>
            <input
              id="current_password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="password">
              Nueva contraseña
            </label>
            <input
              id="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
            />
            <div className="fieldHint" style={passwordError ? { color: '#f44336' } : undefined}>
              {passwordError ?? 'Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.'}
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="password_confirm">
              Confirmar nueva contraseña
            </label>
            <input
              id="password_confirm"
              className="input"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              type="password"
              autoComplete="new-password"
            />
          </div>

          <button className="btn btnPrimary" type="submit" disabled={saving || auth.loading}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>

        <div className="muted" style={{ marginTop: '16px', textAlign: 'center' }}>
          <Link to="/">Volver al inicio</Link>
        </div>
      </div>

      <MessageModal
        open={messageModal.open}
        type={messageModal.type}
        title={messageModal.title}
        message={messageModal.message}
        onClose={() => setMessageModal({ ...messageModal, open: false })}
      />
    </div>
  )
}
