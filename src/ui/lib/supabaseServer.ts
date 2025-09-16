// src/ui/lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

// Prefer server-only vars, but fall back to NEXT_PUBLIC_* if misconfigured.
// (NEXT_PUBLIC_SUPABASE_URL is fine to reuse, but never expose SERVICE_ROLE in public.)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-side Supabase client using the SERVICE ROLE.
 * ⚠️ Never expose this key to the browser. Use only in Route Handlers / Server Actions.
 */
export function supabaseAdmin() {
  if (!SUPABASE_URL && !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. " +
      "Check your Netlify environment settings."
    );
  }
  if (!SUPABASE_URL) {
    throw new Error(
      "Missing SUPABASE_URL. Did you forget to set NEXT_PUBLIC_SUPABASE_URL " +
      "or SUPABASE_URL in Netlify?"
    );
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Make sure it's set in Netlify " +
      "(⚠️ server-only, do not prefix with NEXT_PUBLIC)."
    );
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}