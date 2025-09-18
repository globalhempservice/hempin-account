import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client (SSR/Route Handlers).
 * Uses the ANON key so RLS still applies to the logged-in user session.
 * (Use the service role only in isolated admin jobs, never in requests.)
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options?: Parameters<typeof cookieStore.set>[0] extends object ? Omit<Parameters<typeof cookieStore.set>[0], 'name' | 'value'> : any) {
          cookieStore.set({ name, value, ...(options || {}) } as any)
        },
        remove(name: string, options?: any) {
          // emulate "remove" by setting an already-expired cookie
          cookieStore.set({
            name,
            value: '',
            expires: new Date(0),
            ...(options || {}),
          } as any)
        },
      },
    }
  )
}

/** Back-compat alias for existing imports */
export const createServerClientSupabase = createSupabaseServerClient