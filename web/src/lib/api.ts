import { getToken } from './auth'

/**
 * Base de la API. En producción dejar vacío (peticiones relativas /api).
 * En desarrollo: vacío si usas el proxy de Vite, o VITE_API_URL=http://127.0.0.1:8000
 */
const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${apiBaseUrl}${normalized}`
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(resolveApiUrl(path), { ...init, headers })

  const text = await res.text()

  if (text.trim().startsWith('<')) {
    console.error('Respuesta HTML recibida en lugar de JSON:', text.substring(0, 200))
    throw new Error('El servidor devolvió una página de error. Por favor, revisa los logs del servidor.')
  }

  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      console.error('Error parseando JSON:', text.substring(0, 200))
      throw new Error('El servidor devolvió una respuesta inválida. Por favor, revisa los logs del servidor.')
    }
  }

  if (!res.ok) {
    let message: string | null = null

    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as { message: unknown }).message
      message = typeof m === 'string' ? m : m != null ? String(m) : null
    }

    throw new Error(message || `Error ${res.status}`)
  }

  return data as T
}
