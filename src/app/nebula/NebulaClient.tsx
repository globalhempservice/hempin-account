'use client';
import { useEffect, useState } from 'react';
import { Snapshot } from './lib/types';
import Orb from '@/ui/organisms/Orb';
import TopBar from './components/TopBar';
import ProfilePlanet from './components/ProfilePlanet';
import LeafPill from './components/LeafPill';
import UniverseGrid from './components/UniverseGrid';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorOverlay from './components/ErrorOverlay';

export default function NebulaClient({ initialEmail }: { initialEmail: string | null }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('hempin.account.profile');
    if (raw) {
      try { setData(JSON.parse(raw)); } catch {}
    }
    (async () => {
      try {
        const res = await fetch('/api/account/snapshot', { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const snap = await res.json();
        setData(snap);
        sessionStorage.setItem('hempin.account.profile', JSON.stringify(snap));
      } catch {
        setErr('Could not load your Nebula.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const email = data?.email ?? initialEmail ?? null;

  // Fallback mapping: accept camelCase or snake_case from API/snapshot
  const avatarUrl =
    data?.avatarUrl ?? (data as any)?.avatar_url ?? null;
  const planetColor =
    data?.planetColor ?? (data as any)?.planet_color ?? '#60a5fa';

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center overflow-hidden">
      <TopBar email={email ?? undefined} />
      <Orb className="absolute inset-0 scale-[1.35] md:scale-[1.7]" />

      <section className="relative z-10 mx-auto w-full max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Your Hempin Nebula</h1>
        <p className="mt-2 opacity-80">
          Welcome{email ? `, ${email}` : ''}. Explore universes and grow your Leaf XP.
        </p>

        <div className="mt-12 flex items-center justify-center">
        <ProfilePlanet
  avatarUrl={data?.avatarUrl ?? null}
  color={data?.planetColor ?? '#60a5fa'}
/>
        </div>

        {/* Keep just the Leaf XP pill here to avoid duplicate “Edit profile” */}
        <div className="mt-6 flex justify-center">
          <LeafPill value={data?.leafTotal ?? 0} />
        </div>

        <div className="mt-12">
          <UniverseGrid unlocked={data?.unlocked ?? {}} />
        </div>
      </section>

      <p className="relative z-10 mt-10 text-xs opacity-50">HEMPIN ACCOUNT — 2025</p>
      {loading && <LoadingOverlay text="Loading Nebula…" />}
      {!loading && err && <ErrorOverlay text={err} />}
    </main>
  );
}