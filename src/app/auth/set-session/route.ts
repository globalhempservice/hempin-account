// src/app/api/auth/set-session/route.ts
import { NextResponse } from 'next/server';
import { createServerClientSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { access_token, refresh_token } = await req.json();
    if (!access_token || !refresh_token) {
      return NextResponse.json({ ok: false, error: 'missing tokens' }, { status: 400 });
    }

    const supabase = createServerClientSupabase();
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'server error' }, { status: 500 });
  }
}