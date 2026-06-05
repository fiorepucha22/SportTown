export type AuthUser = {
  id: number
  name: string
  email: string
  is_admin?: boolean
  es_socio?: boolean
  fecha_inicio_socio?: string | null
  fecha_fin_socio?: string | null
  suscripcion_cancelada?: boolean
}

/**
 * Indica si el usuario es socio con la membresía vigente.
 */
export function isSocioActivo(user: AuthUser | null | undefined): boolean {
  if (!user || !user.es_socio || !user.fecha_fin_socio) return false
  const fechaFin = new Date(user.fecha_fin_socio)
  if (Number.isNaN(fechaFin.getTime())) return false
  return fechaFin >= new Date()
}

/**
 * Valida una contraseña segura: mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.
 * Devuelve un mensaje de error o null si es válida.
 */
export function validarPasswordSegura(password: string): string | null {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (!/[A-Z]/.test(password)) return 'La contraseña debe incluir al menos una letra mayúscula.'
  if (!/\d/.test(password)) return 'La contraseña debe incluir al menos un número.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'La contraseña debe incluir al menos un carácter especial.'
  return null
}

const TOKEN_KEY = 'sporttown_token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  window.dispatchEvent(new Event('sporttown-auth-changed'))
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  window.dispatchEvent(new Event('sporttown-auth-changed'))
}


