// src/lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  )
}

// Optional back-compat alias (if any old imports use it)
export const createSupabaseBrowserClient = createClient
export const createBrowserClientCompat = createClient