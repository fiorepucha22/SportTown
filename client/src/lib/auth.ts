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


