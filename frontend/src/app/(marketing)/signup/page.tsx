'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { useToast } from '../../../components/ui/Toast'
import { registerAccount } from '../../../services/authApi'

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (touched.name && name.trim().length < 2) e.name = 'Name is required.'
    if (touched.email && !validateEmail(email)) e.email = 'Enter a valid email.'
    if (touched.password && password.length < 6) e.password = 'Password must be at least 6 characters.'
    if (touched.confirm && confirm !== password) e.confirm = 'Passwords do not match.'
    return e
  }, [name, email, password, confirm, touched])

  const canSubmit =
    name.trim().length >= 2 && validateEmail(email) && password.length >= 6 && confirm === password

  const onSubmit = async () => {
    setTouched({ name: true, email: true, password: true, confirm: true })
    if (!canSubmit) return
    setLoading(true)
    try {
      await registerAccount(name.trim(), email, password)
      toast({ type: 'success', title: 'Account created', description: 'Redirecting to dashboard…' })
      const next = searchParams.get('next')
      router.push(next || '/dashboard')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Please try again.'
      toast({ type: 'error', title: 'Signup failed', description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-pro grid min-h-[calc(100vh-4rem)] place-items-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Modern dark UI with lightweight validation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              error={errors.name}
            />

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
                  <User className="h-4 w-4 opacity-0" />
                </span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={[
                    'h-11 w-full rounded-2xl border px-3 pr-10 text-sm outline-none transition',
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

            <Input
              label="Confirm password"
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              error={errors.confirm}
            />

            <Button className="w-full" isLoading={loading} onClick={onSubmit}>
              Create account
            </Button>

            <p className="text-center text-sm text-muted">
              Already have an account?{' '}
              <Link className="font-semibold text-accent hover:brightness-110" href="/login">
                Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

