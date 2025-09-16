'use client';

import { useEffect, useMemo, useState } from 'react';
import Orb from '@/ui/organisms/Orb';

type RedeemPayload = {
  ok: boolean;
  email?: string;
  campaignSlug?: string;
  fundUnlocked?: boolean;
  profileId?: string;
  leafTotal?: number;
  error?: string;
};

export default function Welcome() {
  const params = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const ht = params.get('ht') || params.get('token') || '';
  const emailParam = params.get('email') || '';
  const src = params.get('src') || undefined;

  const [data, setData] = useState<RedeemPayload | null>(null);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    // 1) Secure handoff: redeem token if present
    if (ht) {
      let alive = true;
      (async () => {
        try {
          const res = await fetch(`/api/handoff/redeem?ht=${encodeURIComponent(ht)}`);
          const json = (await res.json()) as RedeemPayload;
          if (!alive) return;
          if (json?.ok) {
            // Lightweight snapshot used by /nebula
            const snap = {
              profileId: json.profileId ?? null,
              email: json.email ?? null,
              leafTotal: typeof json.leafTotal === 'number' ? json.leafTotal : 0,
              perks: [],
              unlocked: { fund: !!json.fundUnlocked },
            };
            sessionStorage.setItem('hempin.account.profile', JSON.stringify(snap));
            // Celebrate a proper handoff
            window.location.replace('/nebula?welcome=token');
            return;
          }
          setData(json);
        } catch (e: any) {
          setData({ ok: false, error: e?.message ?? 'Failed to redeem' });
        }
      })();
      return () => { /* no-op */ };
    }

    // 2) Soft handoff: email-only from Market
    if (!ht && emailParam) {
      // We don’t authenticate here; just stage a minimal profile snapshot
      const snap = {
        profileId: null,
        email: emailParam,
        // optimistic 1 Leaf (the Market modal already added it server-side, but
        // we can’t read the DB without auth; this is visual)
        leafTotal: 1,
        perks: [],
        unlocked: {}, // nothing unlocked in soft flow
      };
      sessionStorage.setItem('hempin.account.profile', JSON.stringify(snap));
      window.location.replace('/nebula?welcome=soft' + (src ? `&src=${encodeURIComponent(src)}` : ''));
      return;
    }

    // 3) Neither token nor email → show the fallback UI
    setData({ ok: false, error: 'Missing token' });
  }, [ht, emailParam, src]);

  const sendLink = async () => {
    setMsg('Sending magic link…');
    try {
      const r = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data?.email || emailParam }),
      });
      const j = await r.json();
      if (j?.ok) setMsg('Magic link sent. Check your inbox!');
      else setMsg(j?.error ?? 'Failed to send email.');
    } catch (e: any) {
      setMsg(e?.message ?? 'Failed to send email.');
    }
  };

  return (
    <main className="relative min-h-screen grid place-items-center text-center px-6 overflow-hidden">
      <Orb className="absolute inset-0 scale-[1.6] md:scale-[2.1]" />
      <section className="relative z-10 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs opacity-70 mb-2">Welcome</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {data?.ok ? 'Your Fund universe is unlocked' : 'Almost there'}
        </h1>
        <p className="mt-3 opacity-80 text-sm">
          {data?.ok
            ? `Hi ${data?.email ?? 'friend'} — we’ve prepared your account space.`
            : data?.error ?? 'We could not validate your handoff token.'}
        </p>

        {data?.ok && (
          <div className="mt-6 space-y-3">
            <button
              onClick={sendLink}
              className="rounded-md border border-white/15 bg-white/90 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
            >
              Email me a magic sign-in link
            </button>
            <div className="text-xs opacity-70">{msg}</div>
          </div>
        )}

        {!data?.ok && (
          <div className="mt-6 text-xs opacity-70">
            If this keeps happening, contact support and we’ll help you finish onboarding.
          </div>
        )}

        <div className="mt-6 text-xs opacity-50">HEMPIN ACCOUNT — 2025</div>
      </section>
    </main>
  );
}