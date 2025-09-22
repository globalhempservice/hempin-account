// src/lib/supabase/admin.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.SUPABASE_URL || (process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined)
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Create a service-role Supabase client.
 * Returns null if env vars are missing so callers can handle gracefully.
 */
export function createAdminClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SERVICE_ROLE) return null
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  })
}