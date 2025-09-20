'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function parseHash() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return {
    access_token: hash.get('access_token'),
    refresh_token: hash.get('refresh_token'),
  }
}

function safeNext(urlStr: string | null): string | null {
  if (!urlStr) return null
  try {
    const u = new URL(urlStr)
    if (u.protocol !== 'https:') return null
    if (!u.hostname.endsWith('.hempin.org')) return null
    return u.toString()
  } catch {
    return null
  }
}

export default function AuthCallback() {
  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      // Populate localStorage (harmless if already done)
      try { await supabase.auth.getSession() } catch {}

      const { access_token, refresh_token } = parseHash()
      if (access_token && refresh_token) {
        await fetch('/api/auth/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token, refresh_token }),
        }).catch(() => {})
      }

      const clean = new URL(window.location.href)
      clean.hash = ''
      window.history.replaceState(null, '', clean.toString())

      const params = new URLSearchParams(window.location.search)
      const nextUrl = safeNext(params.get('next')) ?? '/nebula'
      window.location.replace(nextUrl)
    })()
  }, [])

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm">
        Finalizing sign-in…
      </div>
    </main>
  )
}