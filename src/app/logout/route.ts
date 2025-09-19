// src/app/logout/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/ui/lib/supabaseServer';

export async function GET() {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  return NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'https://account.hempin.org')
  );
}