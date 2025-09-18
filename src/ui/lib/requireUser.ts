// src/ui/lib/requireUser.ts
import { redirect } from 'next/navigation';
import { createServerSupabase } from './supabaseServer';

export async function requireUser() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return user;
}