// src/app/nebula/NebulaClient.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Orb from '@/ui/organisms/Orb';

type Snapshot = {
  profileId: string | null;
  email: string | null;
  leafTotal: number;
  perks: any[];
  unlocked: { fund?: boolean; market?: boolean };
  avatarUrl?: string | null;
  planetColor?: string | null;
  displayName?: string | null;
};

export default function NebulaClient({ initialEmail }: { initialEmail: string | null }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [celebrateFund, setCelebrateFund] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Load cached snapshot immediately (fast paint)
  useEffect(() => {
    const raw = sessionStorage.getItem('hempin.account.profile');
    if (raw) {
      try {
        setData(JSON.parse(raw) as Snapshot);
      } catch {}
    }
  }, []);

  // Always refresh from server (and recache)
  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const res = await fetch('/api/account/snapshot', { cache: 'no-store' });
        if (!res.ok) throw new Error(`snapshot ${res.status}`);
        const snap = (await res.json()) as Snapshot;
        setData(snap);
        sessionStorage.setItem('hempin.account.profile', JSON.stringify(snap));

        if (snap?.unlocked?.fund) {
          setCelebrateFund(true);
          const t = setTimeout(() => setCelebrateFund(false), 3000);
          return () => clearTimeout(t);
        }
      } catch (e: any) {
        setErr('Could not load your Nebula.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const leaf = useMemo(() => data?.leafTotal ?? 0, [data]);
  const email = data?.email ?? initialEmail ?? null;
  const planetColor = data?.planetColor || '#60a5fa'; // default soft blue
  const avatarUrl = data?.avatarUrl || null;

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center overflow-hidden">
      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link href="/nebula" className="text-sm font-medium opacity-90 hover:opacity-100">
            Hempin Account
          </Link>
          <div className="flex items-center gap-3">
            {email && <span className="text-xs opacity-70 hidden sm:inline">{email}</span>}
            <a
              href="/logout"
              className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15 transition"
            >
              Log out
            </a>
          </div>
        </div>
      </header>

      {/* Subtle background orb */}
      <Orb className="absolute inset-0 scale-[1.35] md:scale-[1.7]" />

      <section className="relative z-10 mx-auto w-full max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Your Hempin Nebula</h1>
        <p className="mt-2 opacity-80">
          Welcome{email ? `, ${email}` : ''}. Explore universes and grow your Leaf XP.
        </p>

        {/* Center profile planet (avatar + color aura) */}
        <div className="mt-12 flex items-center justify-center">
          <div className="relative">
            {/* outer glow/aura using chosen color */}
            <div
              className="absolute -inset-24 blur-3xl opacity-30 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${hexToRgbA(planetColor, 0.45)}, rgba(0,0,0,0) 60%)`,
              }}
            />
            {/* the planet itself */}
            <div
              className="h-44 w-44 rounded-full shadow-2xl ring-1 ring-white/10 overflow-hidden relative"
              style={{
                background: avatarUrl
                  ? `center/cover no-repeat url("${avatarUrl}")`
                  : `linear-gradient(135deg, ${tint(planetColor, 0.35)} 0%, ${tint(planetColor, -0.1)} 100%)`,
              }}
            >
              {/* subtle color veil over the avatar to feel “inside” the planet */}
              <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(120% 120% at 50% 40%, ${hexToRgbA(planetColor, 0.25)}, transparent 60%)` }}
              />
            </div>
          </div>
        </div>

        {/* Action row: edit + Leaf XP */}
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="/profile/edit"
            className="rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/15 transition"
          >
            Edit profile
          </a>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs">
            <span className="opacity-80">Leaf XP</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300">+{leaf}</span>
          </div>
        </div>

        {/* Universes */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-6">
          <FundUniverseCard
            unlocked={!!data?.unlocked?.fund}
            celebrate={celebrateFund}
            onClick={() => alert('Fund universe — perks & receipts (WIP)')}
          />
          <UniverseCard
            title="Market"
            unlocked={!!data?.unlocked?.market}
            accent="from-emerald-400/40 to-teal-400/20"
            badge={data?.unlocked?.market ? 'New' : undefined}
            onClick={() => alert('Market universe — WIP')}
          />
          <UniverseCard title="Farm" />
          <UniverseCard title="Brand" />
          <UniverseCard title="Factory" />
          <UniverseCard title="Knowledge" />
          <UniverseCard title="Shop" />
        </div>
      </section>

      {/* tiny footer */}
      <p className="relative z-10 mt-10 text-xs opacity-50">HEMPIN ACCOUNT — 2025</p>

      {/* loading / error overlay (minimal) */}
      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-md border border-white/10 bg-black/60 px-4 py-3 text-sm">Loading Nebula…</div>
        </div>
      )}
      {!loading && err && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-md border border-white/10 bg-black/70 px-4 py-3 text-sm">
            {err} <button onClick={() => location.reload()} className="underline ml-2">Retry</button>
          </div>
        </div>
      )}
    </main>
  );
}

/* ── helpers for colors ───────────────────────────────────────────── */

function hexToRgbA(hex: string, alpha = 1) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// lighten (>0) or darken (<0)
function tint(hex: string, amount: number) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  let [r, g, b] = [(parseInt(c.slice(0, 2), 16)), (parseInt(c.slice(2, 4), 16)), (parseInt(c.slice(4, 6), 16))];
  const t = amount > 0 ? 255 : 0;
  const p = Math.abs(amount);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/* ── existing cards (unchanged) ───────────────────────────────────── */

function FundUniverseCard({ unlocked, celebrate, onClick }: { unlocked: boolean; celebrate: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={unlocked ? onClick : undefined}
      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition ${
        unlocked ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-white/10 bg-black/20 opacity-70 cursor-not-allowed'
      }`}
    >
      {unlocked && (
        <span className="absolute top-3 right-3 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-emerald-200 text-[11px] leading-none shadow-sm">
          New
        </span>
      )}
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400/70 to-fuchsia-400/50 ring-1 ring-white/10" />
          {unlocked && (
            <>
              <div className="absolute inset-0 rounded-full animate-[ping_2.4s_ease-out_infinite] bg-fuchsia-400/20" />
              <div className="absolute -inset-2 rounded-full blur-xl bg-fuchsia-400/20 opacity-60" />
            </>
          )}
        </div>
        <div>
          <div className="text-sm opacity-80">Fund</div>
          <div className="text-xs opacity-60 mt-1">{unlocked ? 'Unlocked' : 'Locked — coming soon'}</div>
        </div>
      </div>
      {unlocked && celebrate && <Sparkles />}
    </button>
  );
}

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
          const left = 6 + ((i * 6.5) % 86);
          const delay = (i % 7) * 120;
          const size = 3 + (i % 3);
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${left}%`,
                bottom: 8,
                width: size,
                height: size,
                background: 'radial-gradient(closest-side, rgba(255,210,240,.95), rgba(255,210,240,.2) 60%, rgba(255,210,240,0) 70%)',
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

function UniverseCard({
  title,
  unlocked = false,
  accent = 'from-slate-400/40 to-slate-500/20',
  badge,
  onClick,
}: {
  title: string;
  unlocked?: boolean;
  accent?: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={unlocked ? onClick : undefined}
      className={`group relative rounded-2xl border border-white/10 p-5 text-left transition ${
        unlocked ? 'bg-white/5 hover:bg-white/10' : 'bg-black/20 opacity-70 cursor-not-allowed'
      }`}
    >
      {badge && (
        <span className="absolute top-3 right-3 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-emerald-200 text-[11px] leading-none shadow-sm">
          {badge}
        </span>
      )}
      <div className="mb-3 h-10 w-10 rounded-full bg-gradient-to-br ring-1 ring-white/10">
        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${accent}`} />
      </div>
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-xs opacity-60 mt-1">{unlocked ? 'Unlocked' : 'Locked — coming soon'}</div>
    </button>
  );
}