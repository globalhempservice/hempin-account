// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

// Use service role *only* on the server. Never expose this key client-side.
const SUPABASE_URL =
  process.env.SUPABASE_URL || (process.env.NEXT_PUBLIC_SUPABASE_URL as string)
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL')
if (!SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

export function createAdminClient() {
  // No cookie/session persistence for admin operations
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}