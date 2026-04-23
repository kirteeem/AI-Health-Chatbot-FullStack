'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Moon, Sun } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'
import { LogoMark } from '../assets/Logo'

const links = [
  { href: '/home', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/login', label: 'Login' },
]

function isActive(pathname: string, href: string) {
  if (href === '/home') return pathname === '/home'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('ui-mode')
    const next = saved === 'light' ? 'light' : 'dark'
    setMode(next)
    document.documentElement.classList.toggle('light', next === 'light')
    document.documentElement.classList.toggle('dark', next === 'dark')
  }, [])

  const toggleMode = () => {
    const next = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    localStorage.setItem('ui-mode', next)
    document.documentElement.classList.toggle('light', next === 'light')
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  const rightLinks = useMemo(() => links, [])

  return (
    <header className="sticky top-0 z-50">
      <div className="glass border-b border-border/40">
        <div className="container-pro flex h-16 items-center justify-between gap-4">
          <Link href="/home" className="group inline-flex items-center gap-3">
            <LogoMark className="h-9 w-9 transition group-hover:scale-[1.03]" />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-fg">AI Healthcare</p>
              <p className="text-xs text-muted">RAG-powered assistant</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {rightLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-medium text-muted transition',
                  'hover:bg-surface/40 hover:text-fg',
                  isActive(pathname, l.href) ? 'bg-surface/50 text-fg' : '',
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMode}
              className="glass hidden h-10 w-10 items-center justify-center rounded-2xl text-muted transition hover:bg-surface/60 hover:text-fg md:inline-flex"
              aria-label="Toggle theme"
            >
              {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="glass inline-flex h-10 w-10 items-center justify-center rounded-2xl text-muted transition hover:bg-surface/60 hover:text-fg md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/signup" className="hidden md:block">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>

        {open && (
          <div className="container-pro pb-4 md:hidden">
            <div className="mt-2 grid gap-1 rounded-2xl border border-border/50 bg-surface/30 p-2">
              {rightLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'rounded-xl px-3 py-2 text-sm font-medium text-muted transition',
                    'hover:bg-surface/50 hover:text-fg',
                    isActive(pathname, l.href) ? 'bg-surface/60 text-fg' : '',
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-1 flex items-center justify-between gap-2 px-1">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="glass inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-fg"
                >
                  {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {mode === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
                <Link href="/signup" onClick={() => setOpen(false)} className="w-full">
                  <Button className="w-full" size="md">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

