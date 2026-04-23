'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Stethoscope,
  User,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { LogoMark } from '../../components/assets/Logo'
import { AuthGate } from '../../components/auth/AuthGate'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { clearAuthSession, getAuthSession } from '../../lib/authSession'
import { cn } from '../../lib/cn'
import { fetchMe } from '../../services/authApi'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/symptoms', label: 'Symptom checker', icon: Stethoscope },
  { href: '/dashboard/planner', label: 'Planner', icon: UtensilsCrossed },
  { href: '/dashboard/chat', label: 'Chat assistant', icon: MessageSquare },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
]

function pageTitle(pathname: string): string {
  if (pathname.startsWith('/dashboard/chat')) return 'Chat assistant'
  if (pathname.startsWith('/dashboard/symptoms')) return 'Symptom checker'
  if (pathname.startsWith('/dashboard/planner')) return 'Planner'
  if (pathname.startsWith('/dashboard/profile')) return 'Profile'
  return 'Health dashboard'
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userName, setUserName] = useState('User')
  const [userEmail, setUserEmail] = useState('')

  const isChatRoute = pathname.startsWith('/dashboard/chat')

  useEffect(() => {
    const s = getAuthSession()
    if (!s?.token) return
    setUserName(s.user.name || s.user.email?.split('@')[0] || 'User')
    setUserEmail(s.user.email || '')
    fetchMe(s.token)
      .then((u) => {
        setUserName(u.name || u.email?.split('@')[0] || 'User')
        setUserEmail(u.email || '')
      })
      .catch(() => {
        /* AuthGate handles redirect on protected routes */
      })
  }, [])

  const activeHref = useMemo(() => {
    const match = [...nav].sort((a, b) => b.href.length - a.href.length).find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))
    return match?.href
  }, [pathname])

  const onLogout = () => {
    clearAuthSession()
    toast({ type: 'success', title: 'Logged out', description: 'See you next time.' })
    router.push('/home')
  }

  const closeMobile = () => setMobileOpen(false)

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1">
      {nav.map((n) => {
        const Icon = n.icon
        const active = n.href === activeHref
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm font-medium text-muted transition',
              'hover:bg-surface/45 hover:text-fg',
              active ? 'border-border/50 bg-surface/55 text-fg' : '',
              collapsed ? 'md:justify-center' : '',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className={cn(collapsed && 'md:hidden')}>{n.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <AuthGate>
      <div className="min-h-screen">
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm md:hidden"
            onClick={closeMobile}
          />
        )}

        <div className="flex min-h-screen">
          <aside
            className={cn(
              'glass fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border/40 transition-transform md:static md:z-0 md:max-w-none',
              'md:translate-x-0',
              mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
              collapsed ? 'md:w-[76px]' : 'md:w-72',
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/40 p-4">
              <Link href="/home" className="inline-flex min-w-0 items-center gap-3" onClick={closeMobile}>
                <LogoMark className="h-9 w-9 shrink-0" />
                {!collapsed && (
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold">AI Health</p>
                    <p className="text-xs text-muted">Platform</p>
                  </div>
                )}
              </Link>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-xl p-2 text-muted hover:bg-surface/50 hover:text-fg md:hidden"
                  onClick={closeMobile}
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCollapsed((v) => !v)}
                  className="hidden rounded-xl px-2 py-1 text-xs font-semibold text-muted transition hover:bg-surface/50 hover:text-fg md:inline"
                >
                  {collapsed ? '>' : '<'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <p className={cn('px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted', collapsed ? 'sr-only' : '')}>
                Menu
              </p>
              <NavLinks onNavigate={closeMobile} />
            </div>

            <div className="border-t border-border/40 p-3">
              {!collapsed && (
                <div className="mb-3 rounded-2xl bg-surface/35 p-3">
                  <p className="text-xs text-muted">Signed in as</p>
                  <p className="mt-0.5 truncate text-sm font-semibold">{userName}</p>
                  {userEmail && <p className="truncate text-xs text-muted">{userEmail}</p>}
                </div>
              )}
              <Button
                variant="secondary"
                className={cn('w-full', collapsed ? 'px-0' : '')}
                onClick={() => {
                  closeMobile()
                  onLogout()
                }}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && 'Logout'}
              </Button>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col md:pl-0">
            <header className="sticky top-0 z-30 border-b border-border/40 bg-bg/70 backdrop-blur-md">
              <div className={cn('flex h-14 items-center justify-between gap-3 px-4 md:h-16 md:px-6', isChatRoute && 'md:px-4')}>
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-border/50 p-2 text-fg transition hover:bg-surface/50 md:hidden"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">{pageTitle(pathname)}</p>
                    <p className="hidden text-xs text-muted sm:block">AI Health Platform</p>
                  </div>
                </div>
                <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-border/40 bg-surface/30 px-3 py-1.5 sm:flex">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600" aria-hidden />
                  <div className="min-w-0 text-right">
                    <p className="truncate text-sm font-medium">{userName}</p>
                    <p className="truncate text-xs text-muted">{userEmail || '—'}</p>
                  </div>
                </div>
              </div>
            </header>

            <div
              className={cn(
                'flex-1',
                isChatRoute ? 'overflow-hidden p-0' : 'container-pro overflow-auto py-6 md:py-8',
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  )
}
