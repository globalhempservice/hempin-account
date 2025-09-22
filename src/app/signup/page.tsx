// src/app/signup/page.tsx
'use client'

import { useEffect } from 'react'

function safeNext(urlStr: string | null): string {
  if (!urlStr) return '/nebula'
  try {
    const u = new URL(urlStr)
    if (u.protocol !== 'https:') return '/nebula'
    if (!u.hostname.endsWith('.hempin.org')) return '/nebula'
    return u.toString()
  } catch {
    return '/nebula'
  }
}

export default function SignupRedirect() {
  useEffect(() => {
    const url = new URL(window.location.href)
    const next = safeNext(url.searchParams.get('next'))

    const authUrl = new URL('https://auth.hempin.org/login')
    authUrl.searchParams.set('next', next)

    window.location.replace(authUrl.toString())
  }, [])

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm">
        Redirecting to join Hemp’in…
      </div>
    </main>
  )
}