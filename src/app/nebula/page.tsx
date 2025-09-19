// src/app/nebula/page.tsx
import NebulaClient from './NebulaClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NebulaPage() {
  // Ask our API (which CAN set cookies) for the auth snapshot
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/account/snapshot`, {
    cache: 'no-store',
    headers: { 'accept': 'application/json' },
  });

  if (!res.ok) {
    // Not authenticated or API error → go to login
    // We avoid using `redirect()` here to keep it simple client-side:
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="opacity-80">You need to sign in to view your Nebula.</p>
          <a className="mt-4 inline-block rounded bg-white/90 px-4 py-2 text-sm font-medium text-zinc-900" href="/login">
            Go to sign in
          </a>
        </div>
      </main>
    );
  }

  const snap = await res.json().catch(() => ({}));
  const initialEmail: string | null = snap?.email ?? null;

  return <NebulaClient initialEmail={initialEmail} />;
}