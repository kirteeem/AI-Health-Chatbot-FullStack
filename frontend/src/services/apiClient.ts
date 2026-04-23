import { getAuthSession } from '../lib/authSession'

/** Relative `/api/*` calls proxied to FastAPI. Attaches Bearer token when present. */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const session = getAuthSession()
  const headers = new Headers(init.headers)
  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`)
  }
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(input, { ...init, headers })
}
