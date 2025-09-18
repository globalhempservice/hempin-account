// src/ui/lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies as nextCookies, headers as nextHeaders } from 'next/headers';

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
 * Use this in server components, route handlers, and server actions
 * when you need the *logged-in user’s* session.
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
    headers: nextHeaders(),
    cookies: {
      // Adapt Next’s cookie store to Supabase’s cookie interface
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Parameters<typeof cookieStore.set>[0] & { name?: string } = {}) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: Parameters<typeof cookieStore.set>[0] & { name?: string } = {}) {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
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