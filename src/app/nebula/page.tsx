// src/app/nebula/page.tsx
import { headers } from 'next/headers';
import NebulaClient from './NebulaClient';

export const dynamic = 'force-dynamic';

function getOriginFromHeaders(h: Headers) {
  // Prefer public base URL if you’ve set it in Netlify env
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase) return envBase.replace(/\/+$/, '');

  // Build from forwarded headers
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto =
    h.get('x-forwarded-proto') ||
    (host && host.includes('localhost') ? 'http' : 'https');

  return `${proto}://${host}`;
}

export default async function NebulaPage() {
  const h = headers();

  const origin = getOriginFromHeaders(h);
  const url = `${origin}/api/account/snapshot`;

  const res = await fetch(url, {
    method: 'GET',
    // make sure we don’t cache, and pass cookies so the API can read the session
    cache: 'no-store',
    headers: {
      cookie: h.get('cookie') ?? '',
    },
  });

  if (!res.ok) {
    // Surface a soft failure—NebulaClient can show a retry
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