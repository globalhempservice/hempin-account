// src/app/login/page.tsx
'use client'

import { useEffect } from 'react'

function safeNext(urlStr: string | null): string {
  if (!urlStr) return '/'
  try {
    const u = new URL(urlStr)
    // allow only https and *.hempin.org
    if (u.protocol !== 'https:') return '/'
    if (!u.hostname.endsWith('.hempin.org')) return '/'
    return u.toString()
  } catch {
    return '/'
  }
}

export default function LoginPage() {
  useEffect(() => {
    const url = new URL(window.location.href)
    const next = safeNext(url.searchParams.get('next'))

    const authUrl = new URL('https://auth.hempin.org/login')
    authUrl.searchParams.set('next', next)

    // immediately redirect
    window.location.replace(authUrl.toString())
  }, [])

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm">
        Redirecting to sign-in…
      </div>
    </main>
  )
}