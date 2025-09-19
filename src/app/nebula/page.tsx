// src/app/nebula/page.tsx
import NebulaClient from './NebulaClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Snapshot = {
  profileId: string | null;
  email: string | null;
  leafTotal: number;
  perks: any[];
  unlocked: { fund?: boolean; market?: boolean };
};

export default async function NebulaPage() {
  // Prefer a relative URL so we don't depend on NEXT_PUBLIC_BASE_URL in SSR
  const url = '/api/account/snapshot';

  let initialEmail: string | null = null;
  try {
    const res = await fetch(url, { cache: 'no-store' });

    if (res.ok) {
      const snap = (await res.json()) as Partial<Snapshot>;
      initialEmail = (snap?.email as string) ?? null;
    } else if (res.status === 401) {
      // Not logged in → render a minimal CTA (no redirect during RSC)
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
    } else {
      // Non-OK that isn’t 401 – show a soft error instead of throwing
      return (
        <main className="min-h-screen grid place-items-center p-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="opacity-80">We couldn’t load your account right now.</p>
            <a className="mt-4 inline-block rounded border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/15" href="/login">
              Try again
            </a>
          </div>
        </main>
      );
    }
  } catch {
    // Network/function crash → keep the app alive with a friendly message
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="opacity-80">Something went wrong loading your Nebula.</p>
          <a className="mt-4 inline-block rounded border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/15" href="/nebula">
            Retry
          </a>
        </div>
      </main>
    );
  }

  // If we reach here, snapshot loaded — hand off to the client component
  return <NebulaClient initialEmail={initialEmail} />;
}