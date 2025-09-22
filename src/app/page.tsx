// src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'

type Boot =
  | { ok: true; signedIn: true; user: { id: string; email: string | null } }
  | { ok: true; signedIn: false; user: null }
  | { ok: false; signedIn: false; error?: string }

function abs(url: string) {
  const u = new URL(url, window.location.origin)
  return u.toString()
}

export default function AccountHome() {
  const [boot, setBoot] = useState<Boot | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/bootstrap', { cache: 'no-store', credentials: 'include' })
        const json: Boot = await res.json()
        if (!cancelled) setBoot(json)
      } catch {
        if (!cancelled) setBoot({ ok: false, signedIn: false })
      }
    })()
    return () => { cancelled = true }
  }, [])

  const nextNebula = typeof window !== 'undefined' ? abs('/nebula') : '/nebula'
  const authUrl = `https://auth.hempin.org/login?next=${encodeURIComponent(nextNebula)}`

  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-semibold">Hemp’in Account</h1>
        <p className="mt-3 opacity-80">
          Your profile, universes, and Leaf XP — all in one place.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          {boot?.ok && boot.signedIn ? (
            <>
              <a href="/nebula" className="btn-primary rounded-md bg-white text-zinc-900 px-4 py-2 text-sm font-medium">
                Go to Nebula
              </a>
              <a href="/logout" className="btn-ghost rounded-md border border-white/15 px-4 py-2 text-sm">
                Log out
              </a>
            </>
          ) : (
            <a href={authUrl} className="btn-primary rounded-md bg-white text-zinc-900 px-4 py-2 text-sm font-medium">
              Sign in / Join
            </a>
          )}
        </div>
      </div>
    </main>
  )
}