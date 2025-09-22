'use client';

import { useEffect, useState } from 'react';

export default function RedeemHandoffPage() {
  const [msg, setMsg] = useState('Redeeming your handoff…');

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = (url.searchParams.get('token') || url.searchParams.get('ht') || '').trim();
    const src = (url.searchParams.get('src') || '').trim(); // pass through (e.g. market)

    if (!token) {
      setMsg('Missing handoff token.');
      return;
    }

    (async () => {
      try {
        const qs = new URLSearchParams();
        qs.set('ht', token);
        if (src) qs.set('src', src);

        const res = await fetch(`/api/handoff/redeem?${qs.toString()}`);
        const json = await res.json();

        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || 'Failed to redeem handoff.');
        }

        // Store snapshot for Nebula
        const snapshot = {
          profileId: json.profileId ?? null,
          email: json.email ?? null,
          leafTotal: typeof json.leafTotal === 'number' ? json.leafTotal : 0,
          perks: json.perks ?? [],
          unlocked: {
            fund: !!json.fundUnlocked,
            market: !!json.marketUnlocked,
          },
        };
        sessionStorage.setItem('hempin.account.profile', JSON.stringify(snapshot));

        // Go to Nebula
        window.location.replace('/nebula?welcome=token');
      } catch (e: any) {
        setMsg(e?.message ?? 'Something went wrong.');
      }
    })();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold">Finishing up…</h1>
        <p className="mt-3 opacity-80">{msg}</p>
        <p className="mt-6 text-xs opacity-60">
          If this takes too long, you can{' '}
          <a className="underline" href="/">
            return to account home
          </a>
          .
        </p>
      </div>
    </main>
  );
}