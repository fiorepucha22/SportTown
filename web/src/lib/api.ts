import { getToken } from './auth'

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(path, { ...init, headers })

  const text = await res.text()
  
  // Detectar si la respuesta es HTML en lugar de JSON
  if (text.trim().startsWith('<')) {
    console.error('Respuesta HTML recibida en lugar de JSON:', text.substring(0, 200))
    throw new Error('El servidor devolvió una página de error. Por favor, revisa los logs del servidor.')
  }

  let data: any = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch (parseError) {
      console.error('Error parseando JSON:', text.substring(0, 200))
      throw new Error('El servidor devolvió una respuesta inválida. Por favor, revisa los logs del servidor.')
    }
  }

  if (!res.ok) {
    let message: string | null = null

    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as any).message
      message = typeof m === 'string' ? m : m != null ? String(m) : null
    }

    throw new Error(message || `Error ${res.status}`)
  }

  return data as T
}


