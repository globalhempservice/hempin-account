// src/app/nebula/page.tsx
import { headers as nextHeaders } from 'next/headers';
import { redirect } from 'next/navigation';
import NebulaClient from './NebulaClient';

export const dynamic = 'force-dynamic';

export default async function NebulaPage() {
  const h = nextHeaders();

  // Prefer absolute base on hosts like Netlify
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL?.startsWith('http') ? process.env.VERCEL_URL : '');
  const url = `${base}/api/account/snapshot`;

  const res = await fetch(url, {
    headers: { cookie: h.get('cookie') ?? '' },
    cache: 'no-store',
  });

  if (res.status === 401) {
    redirect('/login');
  }

  let snap: any = null;
  try {
    snap = await res.json();
  } catch {
    // fall through to error UI
  }

  if (!res.ok) {
    console.error('snapshot fetch failed', res.status, snap);
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="rounded-xl border border-white/10 bg-black/50 p-6 text-center">
          <p className="mb-3">Something went wrong loading your Nebula.</p>
          <form action="/nebula">
            <button className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 hover:bg-white/15">
              Retry
            </button>
          </form>
        </div>
      </main>
    );
  }

  return <NebulaClient initialEmail={snap?.email ?? null} />;
}