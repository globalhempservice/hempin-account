'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signInPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) setError(error.message);
    else window.location.href = '/';
  }

  async function signInGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: '/auth/callback' },
    });
    if (error) setError(error.message);
  }

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>

        <form onSubmit={signInPassword} className="space-y-3">
          <input name="email" type="email" required placeholder="Email"
                 className="w-full rounded border border-neutral-700 bg-black px-3 py-2" />
          <input name="password" type="password" required placeholder="Password"
                 className="w-full rounded border border-neutral-700 bg-black px-3 py-2" />
          <button disabled={pending}
                  className="w-full rounded bg-white/10 px-3 py-2 hover:bg-white/20">
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <button onClick={signInGoogle}
                className="w-full rounded border border-neutral-700 px-3 py-2 hover:bg-neutral-900/50">
          Continue with Google
        </button>

        <div className="text-sm text-neutral-400">
          No account? <Link className="underline" href="/signup">Create one</Link>
        </div>
      </div>
    </main>
  );
}