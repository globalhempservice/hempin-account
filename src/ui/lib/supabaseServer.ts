// src/ui/lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

const SITE = process.env.NEXT_PUBLIC_SITE_ENV || 'unset';
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-only debug (does not leak secret values)
if (typeof window === 'undefined') {
  console.log(
    `[account] env summary → SITE=${SITE} | URL=${SUPABASE_URL ? 'SET' : 'MISSING'} | SERVICE_ROLE=${SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'} | ANON=${SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}`
  );
}

/**
 * Server-side Supabase client bound to the request cookies.
 * Uses the *deprecated* CookieMethodsServer shape (get/set/remove),
 * which matches the version of @supabase/ssr in this project.
 */
export function createServerSupabase() {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (missing.length) {
    throw new Error(
      `Missing required env: ${missing.join(', ')} (SITE=${SITE}). Check Netlify env for account.hempin.org.`
    );
  }

  const cookieStore = nextCookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: any) {
        // Next 14 cookies().set supports (name, value, options)
        cookieStore.set(name, value, options as any);
      },
      remove(name: string, options?: any) {
        // Clearing via set with maxAge: 0
        cookieStore.set(name, '', { ...(options || {}), maxAge: 0 } as any);
      },
    },
  });
}

/**
 * Admin client using the SERVICE ROLE key.
 * ⚠️ Use ONLY on the server for privileged operations.
 */
export function supabaseAdmin() {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length) {
    throw new Error(
      `Missing required env: ${missing.join(', ')} (SITE=${SITE}). Check Netlify env for account.hempin.org.`
    );
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}