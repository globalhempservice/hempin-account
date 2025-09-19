// src/app/nebula/page.tsx
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/ui/lib/supabaseServer';
import NebulaClient from './NebulaClient';

export default async function NebulaPage() {
  // Server-side auth check (no flash of unauth content)
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not signed in → go sign in
    redirect('/login');
  }

  // Pass a few safe bits to the client UI
  return <NebulaClient initialEmail={user.email ?? null} />;
}