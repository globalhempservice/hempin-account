import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Preferred server helper (uses service role for admin/server-only ops).
 * If you do NOT want RLS bypass here, swap the key to ANON and ensure policies allow it.
 */
export function createSupabaseServerClient() {
  return createServerClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { cookies, headers }
  )
}

/**
 * Back-compat alias for existing imports in pages
 * (e.g. import { createServerClientSupabase } from '@/lib/supabase/server')
 */
export const createServerClientSupabase = createSupabaseServerClient