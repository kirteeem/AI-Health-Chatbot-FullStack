'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { useToast } from '../../../components/ui/Toast'
import { loginAccount } from '../../../services/authApi'

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (touched.email && !validateEmail(email)) e.email = 'Enter a valid email.'
    if (touched.password && password.length < 6) e.password = 'Password must be at least 6 characters.'
    return e
  }, [email, password, touched])

  const canSubmit = validateEmail(email) && password.length >= 6

  const onSubmit = async () => {
    setTouched({ email: true, password: true })
    if (!canSubmit) return
    setLoading(true)
    try {
      await loginAccount(email, password)
      if (remember) localStorage.setItem('demo-remember', '1')
      toast({ type: 'success', title: 'Welcome back', description: 'Redirecting to dashboard…' })
      const next = searchParams.get('next')
      router.push(next || '/dashboard')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Please try again.'
      toast({ type: 'error', title: 'Login failed', description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-pro grid min-h-[calc(100vh-4rem)] place-items-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Access your dashboard and saved activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              error={errors.email}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fg">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={[
                    'h-11 w-full rounded-2xl border px-10 text-sm outline-none transition',
                    'bg-surface/40 border-border/60 placeholder:text-muted/70',
                    'focus:border-accent/70 focus:ring-2 focus:ring-accent/25',
                    errors.password ? 'border-red-400/70 focus:border-red-400/70 focus:ring-red-500/20' : '',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-muted transition hover:bg-surface/40 hover:text-fg"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-300">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-border/60 bg-surface/40 text-accent focus:ring-accent/30"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => toast({ type: 'info', title: 'Forgot password', description: 'Hook this to your auth system.' })}
                className="text-sm font-medium text-accent transition hover:brightness-110"
              >
                Forgot password?
              </button>
            </div>

            <Button className="w-full" isLoading={loading} onClick={onSubmit}>
              Continue
            </Button>

            <p className="text-center text-sm text-muted">
              Don’t have an account?{' '}
              <Link className="font-semibold text-accent hover:brightness-110" href="/signup">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

