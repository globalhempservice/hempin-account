// src/lib/supabase/server.ts
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const PARENT_DOMAIN = '.hempin.org' // share session across all subdomains

export function createServerClientSupabase() {
  const cookieStore = cookies()

  return createSupabaseServerClient(
    process.env.SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(
          name: string,
          value: string,
          options?: Parameters<typeof cookieStore.set>[0] extends object
            ? Omit<Parameters<typeof cookieStore.set>[0], 'name' | 'value'>
            : any
        ) {
          cookieStore.set({
            name,
            value,
            domain: PARENT_DOMAIN,
            path: '/',
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            ...(options || {}),
          } as any)
        },
        remove(name: string, options?: any) {
          cookieStore.set({
            name,
            value: '',
            domain: PARENT_DOMAIN,
            path: '/',
            expires: new Date(0),
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            ...(options || {}),
          } as any)
        },
      },
    }
  )
}

// Back-compat alias for existing imports elsewhere in the app
export const createServerClientLegacy = createServerClientSupabase