'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

function safeNext(urlStr: string | null): string | null {
  if (!urlStr) return null;
  try {
    const u = new URL(urlStr);
    // Allow only *.hempin.org (secure subdomains)
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

      // 1) Parse URL hash (contains access_token) and write cookies for parent domain
      try {
        await supabase.auth.getSession();
      } catch (e) {
        console.error('Error finalizing session', e);
      }

      // 2) Figure out where to send the user next
      const params = new URLSearchParams(window.location.search);
      const nextUrl = safeNext(params.get('next')) ?? '/nebula';

      // 3) Clean up hash and redirect
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