'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // If already signed in, go to nebula
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) window.location.replace('/nebula');
    })();
  }, [supabase]);

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    setPending(false);
    if (error) setError(error.message);
    else window.location.href = '/nebula';
  }

  return (
    <main className="relative min-h-screen grid place-items-center p-5 overflow-hidden">
      <AuthBackdrop />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md p-6 shadow-2xl">
        <h1 className="text-xl font-semibold tracking-tight">Welcome to your Hempin account</h1>
        <p className="mt-1 text-sm text-white/60">
          Sign in to access your Nebula and the rest of the ecosystem.
        </p>

        <form onSubmit={signInPassword} className="mt-5 space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20"
          />
          <button
            disabled={pending}
            className="w-full rounded-md bg-white/90 text-zinc-900 px-3 py-2 text-sm font-medium hover:bg-white disabled:opacity-60"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        {/* Prominent create-account button */}
        <div className="mt-6">
          <Link
            href="/signup"
            className="block w-full text-center rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
          >
            New here? Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}

function AuthBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(120,200,255,.35), rgba(0,0,0,0) 60%)' }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(160,120,255,.28), rgba(0,0,0,0) 60%)' }}
      />
    </div>
  );
}