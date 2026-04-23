import { formatApiErrorBody } from '../lib/apiErrors'
import { clearAuthSession, setAuthSession, type AuthSession, type AuthUser } from '../lib/authSession'

export async function registerAccount(name: string, email: string, password: string): Promise<AuthSession> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    }),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(formatApiErrorBody(res.status, text))
  }
  const data = JSON.parse(text) as { access_token: string; user: AuthUser }
  const session: AuthSession = { token: data.access_token, user: data.user }
  setAuthSession(session)
  return session
}

export async function loginAccount(email: string, password: string): Promise<AuthSession> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  })
  const text = await res.text()
  if (!res.ok) {
    const msg = formatApiErrorBody(res.status, text)
    throw new Error(msg || 'Invalid email or password')
  }
  const data = JSON.parse(text) as { access_token: string; user: AuthUser }
  const session: AuthSession = { token: data.access_token, user: data.user }
  setAuthSession(session)
  return session
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    clearAuthSession()
    throw new Error('Session expired')
  }
  return res.json() as Promise<AuthUser>
}
