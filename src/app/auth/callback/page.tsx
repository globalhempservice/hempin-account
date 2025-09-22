// src/app/auth/callback/page.tsx
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

export default function AccountAuthCallbackForwarder() {
  useEffect(() => {
    const url = new URL(window.location.href)
    const next = safeNext(url.searchParams.get('next'))

    // Always forward to the central auth service
    const authUrl = new URL('https://auth.hempin.org/login')
    authUrl.searchParams.set('next', next)

    // If a supabase code accidentally lands here, keep it in the URL
    // so the auth hub can still finalize properly.
    const code = url.searchParams.get('code')
    if (code) authUrl.searchParams.set('code', code)

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