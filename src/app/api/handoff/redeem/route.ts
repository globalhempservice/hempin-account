'use client';

import { useEffect, useState } from 'react';

export default function RedeemHandoffPage() {
  const [msg, setMsg] = useState('Redeeming your handoff…');

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = (url.searchParams.get('token') || url.searchParams.get('ht') || '').trim();

    if (!token) {
      setMsg('Missing handoff token.');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/handoff/redeem?token=${encodeURIComponent(token)}`);
        const json = await res.json();

        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || 'Failed to redeem handoff.');
        }

        // Store a lightweight snapshot for the next screen
        const snapshot = {
          profileId: json.profileId ?? null,
          email: json.email ?? null,
          leafTotal: json.leafTotal ?? 0,
          perks: json.perks ?? [],
          unlocked: { fund: !!json.fundUnlocked },
        };
        sessionStorage.setItem('hempin.account.profile', JSON.stringify(snapshot));

        // Off we go
        window.location.replace('/nebula?welcome=1');
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