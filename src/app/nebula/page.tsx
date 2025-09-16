// src/app/nebula/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Orb from '@/ui/organisms/Orb';

type Snapshot = {
  profileId: string | null;
  email: string | null;
  leafTotal: number;
  perks: any[];
  unlocked: { fund?: boolean 
    market?: boolean;
  };
};

export default function NebulaPage() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [celebrateFund, setCelebrateFund] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('hempin.account.profile');
    if (!raw) return;
    try {
      const snap = JSON.parse(raw) as Snapshot;
      setData(snap);

      // Trigger a short celebration if Fund is unlocked
      if (snap?.unlocked?.fund) {
        setCelebrateFund(true);
        const t = setTimeout(() => setCelebrateFund(false), 3000);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const leaf = useMemo(() => data?.leafTotal ?? 0, [data]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center overflow-hidden">
      {/* Subtle background orb */}
      <Orb className="absolute inset-0 scale-[1.35] md:scale-[1.7]" />

      <section className="relative z-10 mx-auto w-full max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Your Hempin Nebula</h1>
        <p className="mt-2 opacity-80">
          Welcome{data?.email ? `, ${data.email}` : ''}. Explore universes and grow your Leaf XP.
        </p>

        {/* Center profile orb */}
        <div className="mt-12 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-24 blur-3xl opacity-30 pointer-events-none" />
            <div className="h-44 w-44 rounded-full bg-gradient-to-br from-sky-400/50 to-indigo-400/30 shadow-2xl ring-1 ring-white/10" />
          </div>
        </div>

        {/* Leaf XP pill */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs">
            <span className="opacity-80">Leaf XP</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
              +{leaf}
            </span>
          </div>
        </div>

        {/* Universes */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-6">
          {/* Fund — unlocked glow + sparkles */}
          <FundUniverseCard
            unlocked={!!data?.unlocked?.fund}
            celebrate={celebrateFund}
            onClick={() => alert('Fund universe — perks & receipts (WIP)')}
          />

          {/* Others locked for now */}
          <UniverseCard title="Farm" />
          <UniverseCard title="Brand" />
          <UniverseCard title="Factory" />
          <UniverseCard title="Knowledge" />
          // inside the grid, next to Fund
<UniverseCard
  title="Market"
  unlocked={!!data?.unlocked?.market}
  accent="from-emerald-400/40 to-teal-400/20"
  onClick={() => alert('Market universe — WIP')}
/>
        </div>

        {/* CTA row */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/welcome"
            className="rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/15 transition"
          >
            Back to account home
          </a>
          <button
            onClick={() => alert('Profile editor coming soon')}
            className="rounded-md bg-white/90 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
          >
            Complete your profile
          </button>
        </div>
      </section>

      <p className="relative z-10 mt-10 text-xs opacity-50">HEMPIN ACCOUNT — 2025</p>
    </main>
  );
}

/* ────────────────────────────── Fund card (glowing) ───────────────────────────── */

function FundUniverseCard({
  unlocked,
  celebrate,
  onClick,
}: {
  unlocked: boolean;
  celebrate: boolean;
  onClick?: () => void;
}) {
  // pink/fuchsia glow + subtle pulse
  return (
    <button
      onClick={unlocked ? onClick : undefined}
      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition ${
        unlocked
          ? 'border-white/10 bg-white/5 hover:bg-white/10'
          : 'border-white/10 bg-black/20 opacity-70 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Orb avatar */}
        <div className="relative h-12 w-12 shrink-0">
          {/* base orb */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400/70 to-fuchsia-400/50 ring-1 ring-white/10" />
          {/* inner pulse ring when unlocked */}
          {unlocked && (
            <>
              <div className="absolute inset-0 rounded-full animate-[ping_2.4s_ease-out_infinite] bg-fuchsia-400/20" />
              <div className="absolute -inset-2 rounded-full blur-xl bg-fuchsia-400/20 opacity-60" />
            </>
          )}
        </div>

        <div>
          <div className="text-sm opacity-80">Fund</div>
          <div className="text-xs opacity-60 mt-1">
            {unlocked ? 'Unlocked' : 'Locked — coming soon'}
          </div>
        </div>

        {unlocked && (
          <div className="ml-auto rounded-full border border-white/15 bg-emerald-500/20 px-2 py-0.5 text-emerald-300 text-[11px]">
            New
          </div>
        )}
      </div>

      {/* Celebration sparkles (brief on first load after handoff) */}
      {unlocked && celebrate && <Sparkles />}
    </button>
  );
}

/* Little sparkles that float up & fade for ~3s */
function Sparkles() {
  return (
    <>
      <style>{`
        @keyframes sparkleRise {
          0%   { transform: translateY(12px) scale(.8); opacity: 0 }
          10%  { opacity: .9 }
          100% { transform: translateY(-22px) scale(1.05); opacity: 0 }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 14 }).map((_, i) => {
          const left = 6 + (i * 6.5) % 86; // scatter horizontally
          const delay = (i % 7) * 120; // stagger
          const size = 3 + (i % 3); // 3-5px
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${left}%`,
                bottom: 8,
                width: size,
                height: size,
                background:
                  'radial-gradient(closest-side, rgba(255,210,240,.95), rgba(255,210,240,.2) 60%, rgba(255,210,240,0) 70%)',
                animation: `sparkleRise ${900 + (i % 5) * 120}ms ease-out ${delay}ms forwards`,
                filter: 'drop-shadow(0 0 4px rgba(255,180,230,.85))',
              }}
            />
          );
        })}
      </div>
    </>
  );
}

/* ────────────────────────────── Generic locked card ──────────────────────────── */

function UniverseCard({
  title,
  unlocked = false,
  accent = 'from-slate-400/40 to-slate-500/20',
  onClick,
}: {
  title: string;
  unlocked?: boolean;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={unlocked ? onClick : undefined}
      className={`group relative rounded-2xl border border-white/10 p-5 text-left transition ${
        unlocked ? 'bg-white/5 hover:bg-white/10' : 'bg-black/20 opacity-70 cursor-not-allowed'
      }`}
    >
      <div className="mb-3 h-10 w-10 rounded-full bg-gradient-to-br ring-1 ring-white/10" style={{ backgroundImage: undefined, background: undefined }}>
        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${accent}`} />
      </div>
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-xs opacity-60 mt-1">
        {unlocked ? 'Unlocked' : 'Locked — coming soon'}
      </div>
    </button>
  );
}