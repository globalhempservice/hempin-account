import { NextResponse } from 'next/server';
import { createServerClientSupabase } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServerClientSupabase();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'https://account.hempin.org'));
}