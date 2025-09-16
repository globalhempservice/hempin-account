// src/ui/lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

const SITE = process.env.NEXT_PUBLIC_SITE_ENV || 'unset';
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only debug (does not leak secret values)
if (typeof window === 'undefined') {
  // Only log a summary, never the values
  console.log(
    `[account] env summary → SITE=${SITE} | SUPABASE_URL=${SUPABASE_URL ? 'SET' : 'MISSING'} | SERVICE_ROLE=${SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'}`
  );
}

/**
 * Server-side Supabase client using the SERVICE ROLE.
 * ⚠️ Never expose this key to the browser. Use only in Route Handlers / Server Actions.
 */
export function supabaseAdmin() {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length) {
    // This message shows in the page error; the detailed summary is in server logs
    throw new Error(
      `Missing required env: ${missing.join(', ')} (SITE=${SITE}). Check Netlify env for account.hempin.org.`
    );
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}