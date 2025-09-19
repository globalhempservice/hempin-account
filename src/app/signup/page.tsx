'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Phase = 'form' | 'check-email';

export default function SignupPage() {
  const supabase = createClient();
  const [phase, setPhase] = useState<Phase>('form');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  const [status, setStatus] = useState<string | null>(null); // success/info text
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // If already signed in, go to nebula
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) window.location.replace('/nebula');
    })();
  }, [supabase]);

  function buildRedirectTo() {
    const base =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL || 'https://account.hempin.org';
    return `${base}/auth/callback`;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setStatus(null);
    setPending(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pwd,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: buildRedirectTo(),
      },
    });

    setPending(false);

    if (error) {
      setErr(error.message);
      return;
    }

    if (data.session) {
      // If email confirmation is OFF, session may already exist.
      window.location.href = '/nebula';
      return;
    }

    // Show a single, clear success line on the waiting screen.
    setPhase('check-email');
    setStatus(`Confirmation email sent to ${email}. Open it on this device to continue.`);
  }

  async function resend() {
    setErr(null);
    setStatus(null);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: buildRedirectTo() },
    });
    if (error) setErr(error.message);
    else setStatus('Email re-sent. Please check your inbox.');
  }

  return (
    <main className="relative min-h-screen grid place-items-center p-5 overflow-hidden">
      <AuthBackdrop />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md p-6 shadow-2xl">
        {phase === 'form' ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight">Create your Hempin account</h1>
            <p className="mt-1 text-sm text-white/60">One account for your whole Hempin Nebula.</p>

            <form onSubmit={handleSignup} className="mt-5 space-y-3">
              <input
                name="display_name"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20"
              />
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
                {pending ? 'Creating…' : 'Create account'}
              </button>
            </form>

            {err && <p className="mt-3 text-sm text-red-400">{err}</p>}

            <p className="mt-6 text-sm text-white/60">
              Already have an account?{' '}
              <Link className="underline" href="/login">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>

            {/* Single, non-duplicated status line */}
            {status && <p className="mt-2 text-sm text-emerald-300">{status}</p>}
            {err && <p className="mt-2 text-sm text-red-400">{err}</p>}

            {/* Small intro above the tips */}
            <p className="mt-6 text-sm text-white/70">After confirmation, here’s what you can do in Hempin:</p>

            <div className="mt-3 grid gap-3">
              <TipCard title="Your Nebula" body="Unlock universes (Market, Fund, more) from a single account." />
              <TipCard title="Leaf XP" body="Collect Leaf XP across the ecosystem for perks & access." />
              <TipCard title="Privacy-first" body="Public profile is optional and separate from your account." />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={resend}
                className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
              >
                Resend email
              </button>
              <Link href="/login" className="text-sm underline opacity-80 hover:opacity-100">
                Back to sign in
              </Link>
            </div>
          </>
        )}
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

function TipCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3 text-left">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-xs opacity-70">{body}</div>
    </div>
  );
}