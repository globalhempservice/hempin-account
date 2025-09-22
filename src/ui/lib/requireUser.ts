// src/ui/lib/requireUser.ts
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClientSupabase } from './supabaseServer'

function absUrlForNext(path: string) {
  const h = headers()
  const host = h.get('x-forwarded-host') || h.get('host') || ''
  const proto =
    h.get('x-forwarded-proto') ||
    (host.includes('localhost') ? 'http' : 'https')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${proto}://${host}${normalized}`
}

/**
 * Server-only helper.
 * - Ensures there is a Supabase user.
 * - If not, redirects to the auth hub with a safe absolute `next`.
 * - Returns `{ user, supabase }` so pages can keep using the client.
 */
export async function requireUser(nextPath: string) {
  const supabase = createServerClientSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const next = absUrlForNext(nextPath)
    redirect(`https://auth.hempin.org/login?next=${encodeURIComponent(next)}`)
  }

  return { user: user!, supabase }
}