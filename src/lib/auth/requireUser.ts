// src/lib/auth/requireUser.ts
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClientSupabase } from '@/lib/supabase/server'

/**
 * Server-side guard: ensure a signed-in user.
 * If not signed in, redirect to the auth hub with a safe absolute `next`.
 */
export async function requireUser(nextPath?: string) {
  const supabase = createServerClientSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) return user

  // Build absolute URL for `next` (either provided or current request path)
  const h = headers()
  const host = h.get('x-forwarded-host') || h.get('host') || ''
  const proto =
    h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')

  // Prefer explicit nextPath when callers know it; otherwise infer current path
  const path = nextPath || (h.get('x-invoke-path') || '') || '' // x-invoke-path is not standard, best-effort
  // Fallback: try Referer pathname if we have nothing else
  let absNext = `${proto}://${host}${path || ''}`
  try {
    // If Referer is present and same host, use its pathname
    const ref = h.get('referer')
    if (!path && ref) {
      const r = new URL(ref)
      if (r.host === host) absNext = `${proto}://${host}${r.pathname}${r.search || ''}`
    }
  } catch {}

  const loginUrl = `https://auth.hempin.org/login?next=${encodeURIComponent(absNext)}`
  redirect(loginUrl)
}