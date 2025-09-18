import { createBrowserClient } from '@supabase/ssr'

/**
 * Preferred helper
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  )
}

/**
 * Back-compat alias for existing imports in pages
 * (e.g. import { createClient } from '@/lib/supabase/client')
 */
export const createClient = createSupabaseBrowserClient