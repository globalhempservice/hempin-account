// src/lib/supabase/server.ts
import { cookies } from 'next/headers'
import {
  createServerClient as createSsrClient,
  type CookieOptions,
} from '@supabase/ssr'
import { createClient as createSbClient } from '@supabase/supabase-js'

/**
 * We set cookies on the parent domain so ALL subdomains share the session.
 * These flags are strict to satisfy modern browsers:
 *  - httpOnly: true
 *  - sameSite: 'none'
 *  - secure: true (required with SameSite=None)
 */
const PARENT_DOMAIN = '.hempin.org'

const SUPABASE_URL =
  process.env.SUPABASE_URL || (process.env.NEXT_PUBLIC_SUPABASE_URL as string)
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)

function withDefaults(opts?: Partial<CookieOptions>): CookieOptions {
  return {
    domain: PARENT_DOMAIN,
    path: '/',
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    ...(opts || {}),
  } as CookieOptions
}

export function createServerClientSupabase() {
  const cookieStore = cookies()

  return createSsrClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options?: CookieOptions) {
        cookieStore.set({ name, value, ...withDefaults(options) })
      },
      remove(name: string, options?: CookieOptions) {
        cookieStore.set({
          name,
          value: '',
          ...withDefaults({ ...(options || {}), expires: new Date(0) }),
        })
      },
    },
  })
}

/**
 * Safe admin client.
 * - Returns `null` if URL or service role key not configured.
 * - No throw at import time (so builds don’t crash).
 */
export function supabaseAdmin() {
  const url = SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSbClient(url, key, { auth: { persistSession: false } })
}

// Back-compat alias for older imports
export const createServerClient = createServerClientSupabase