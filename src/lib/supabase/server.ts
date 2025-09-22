// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const PARENT_DOMAIN = '.hempin.org'

export function createServerClientSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.SUPABASE_URL as string,                    // ← server URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,   // ← anon key
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options?: any) {
          cookieStore.set({ name, value, domain: PARENT_DOMAIN, path: '/', httpOnly: true, sameSite: 'lax', secure: true, ...(options||{}) } as any)
        },
        remove(name: string, options?: any) {
          cookieStore.set({ name, value: '', domain: PARENT_DOMAIN, path: '/', expires: new Date(0), httpOnly: true, sameSite: 'lax', secure: true, ...(options||{}) } as any)
        },
      },
    }
  )
}