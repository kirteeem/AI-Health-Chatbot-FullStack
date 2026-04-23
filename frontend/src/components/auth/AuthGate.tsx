'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAuthSession } from '../../lib/authSession'
import { Loader } from '../ui/Loader'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const session = getAuthSession()
    if (session?.token) {
      setReady(true)
      return
    }
    const next = search?.toString() ? `${pathname}?${search.toString()}` : pathname
    router.replace(`/login?next=${encodeURIComponent(next)}`)
  }, [pathname, router, search])

  if (!ready) {
    return (
      <div className="container-pro py-14">
        <Loader />
      </div>
    )
  }

  return <>{children}</>
}

