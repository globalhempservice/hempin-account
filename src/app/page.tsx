import Link from 'next/link';
import { requireUser } from '@/lib/auth/requireUser';
import { createServerClientSupabase } from '@/lib/supabase/server';

export default async function AccountHome() {
  const user = await requireUser();
  const supabase = createServerClientSupabase();

  // Ensure profile exists (create on first login)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  // Minimal: create missing profile record
  if (!profile) {
    await supabase.from('profiles').insert({
      auth_user_id: user.id,
      display_name: user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'New user'
    });
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your account</h1>
        <Link className="rounded border border-neutral-700 px-3 py-1 hover:bg-neutral-900/50" href="/logout">
          Log out
        </Link>
      </div>

      <div className="mt-6 space-y-2 text-neutral-300">
        <div><span className="text-neutral-500">Email:</span> {user.email}</div>
        <div><span className="text-neutral-500">User ID:</span> {user.id}</div>
      </div>

      <div className="mt-6">
        <Link href="/profile" className="underline">Edit profile</Link>
      </div>
    </main>
  );
}