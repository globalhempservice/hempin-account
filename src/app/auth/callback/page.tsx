// src/app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

function safeNext(urlStr: string | null) {
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

export default function AuthCallback() {
  useEffect(() => {
    (async () => {
      const supabase = createClient();

      // If magic-link returned ?code=..., exchange it
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        try { await supabase.auth.exchangeCodeForSession(code); } catch {}
      } else {
        // Or if tokens came in the hash, parse & set client session
        try { await supabase.auth.getSession(); } catch {}
      }

      // Ask server to set parent-domain cookies
      const { data } = await supabase.auth.getSession();
      const access_token = data.session?.access_token;
      const refresh_token = data.session?.refresh_token;
      if (access_token && refresh_token) {
        await fetch('/api/auth/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ access_token, refresh_token }),
        }).catch(() => {});
      }

      // Redirect to next or /nebula
      const next = safeNext(url.searchParams.get('next')) ?? '/nebula';
      url.searchParams.delete('code'); url.hash = '';
      window.history.replaceState(null, '', url.toString());
      window.location.replace(next);
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