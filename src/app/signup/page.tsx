'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SignupPage() {
  const supabase = createClient();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null); setErr(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const display_name = (form.elements.namedItem('display_name') as HTMLInputElement).value;

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { display_name }, // gets mirrored to user_metadata
        emailRedirectTo: '/auth/callback',
      }
    });

    if (error) { setErr(error.message); return; }

    if (data.user?.identities && data.user?.identities.length > 0) {
      // If email confirm is off, session might be active already:
      window.location.href = '/';
    } else {
      setMsg('Check your email to confirm your account.');
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
        <h1 className="text-xl font-semibold">Create account</h1>
        <form onSubmit={signUp} className="space-y-3">
          <input name="display_name" placeholder="Display name" className="w-full rounded border border-neutral-700 bg-black px-3 py-2" />
          <input name="email" type="email" required placeholder="Email" className="w-full rounded border border-neutral-700 bg-black px-3 py-2" />
          <input name="password" type="password" required placeholder="Password" className="w-full rounded border border-neutral-700 bg-black px-3 py-2" />
          <button className="w-full rounded bg-white/10 px-3 py-2 hover:bg-white/20">Sign up</button>
        </form>
        {msg && <div className="text-sm text-emerald-400">{msg}</div>}
        {err && <div className="text-sm text-red-400">{err}</div>}
        <div className="text-sm text-neutral-400">
          Already have an account? <Link className="underline" href="/login">Sign in</Link>
        </div>
      </div>
    </main>
  );
}