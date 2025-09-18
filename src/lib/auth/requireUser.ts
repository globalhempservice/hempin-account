import { redirect } from 'next/navigation';
import { createServerClientSupabase } from '@/lib/supabase/server';

export async function requireUser() {
  const supabase = createServerClientSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return user;
}