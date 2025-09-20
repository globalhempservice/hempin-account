'use client';

import { useEffect } from 'react';

function safeNext(urlStr: string | null): string | null {
  if (!urlStr) return null;
  try {
    const u = new URL(urlStr);
    if (u.protocol !== 'https:') return null;
    if (!u.hostname.endsWith('.hempin.org')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function getHashParams(): Record<string, string> {
  const hash = (typeof window !== 'undefined' && window.location.hash) || '';
  const qs = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const out: Record<string, string> = {};
  qs.forEach((v, k) => (out[k] = v));
  return out;
}

export default function AuthCallback() {
  useEffect(() => {
    (async () => {
      // 1) read tokens from the hash (supabase puts them there for magic links)
      const hp = getHashParams();
      const access_token = hp['access_token'];
      const refresh_token = hp['refresh_token'];

      // 2) ask the server route to set the session cookies on .hempin.org
      if (access_token && refresh_token) {
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token, refresh_token }),
          credentials: 'include',
        }).catch(() => {});
      }

      // 3) compute next URL (default: /nebula)
      const search = new URLSearchParams(window.location.search);
      const nextUrl = safeNext(search.get('next')) ?? '/nebula';

      // 4) clean URL & go
      const clean = new URL(window.location.href);
      clean.hash = '';
      window.history.replaceState(null, '', clean.toString());
      window.location.replace(nextUrl);
    })();
  }, []);

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm">
        Finalizing sign-in…
      </div>
    </main>
  );
}