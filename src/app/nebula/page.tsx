// src/app/nebula/page.tsx
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClientSupabase } from '@/lib/supabase/server';
import NebulaClient from './NebulaClient';

export const dynamic = 'force-dynamic';

function getOriginFromHeaders(h: Headers) {
  // Prefer a configured public base URL if present
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase) return envBase.replace(/\/+$/, '');

  // Derive from forwarded headers (Netlify / proxies)
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto =
    h.get('x-forwarded-proto') ||
    (host && host.includes('localhost') ? 'http' : 'https');

  return `${proto}://${host}`;
}

export default async function NebulaPage() {
  const h = headers();

  // --- 1) Server-side auth guard -------------------------------------------
  const supabase = createServerClientSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const origin = getOriginFromHeaders(h);
    const nextAbs = `${origin}/nebula`;
    const authUrl = new URL('https://auth.hempin.org/login');
    authUrl.searchParams.set('next', nextAbs);
    redirect(authUrl.toString());
  }

  // --- 2) Load snapshot (no cache; include cookies) ------------------------
  const origin = getOriginFromHeaders(h);
  const url = `${origin}/api/account/snapshot`;

  const res = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    // forward cookies so the API can read the session
    headers: { cookie: h.get('cookie') ?? '' },
  });

  if (!res.ok) {
    // Soft failure: give the user a retry affordance
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="rounded-xl border border-white/10 bg-black/50 p-6 text-center">
          <p>Something went wrong loading your Nebula.</p>
          <form>
            <button
              formAction="/nebula"
              className="mt-3 rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Retry
            </button>
          </form>
        </div>
      </main>
    );
  }

  const snap = await res.json();
  const initialEmail: string | null = snap?.email ?? null;

  return <NebulaClient initialEmail={initialEmail} />;
}