// src/app/api/account/snapshot/route.ts
import { NextResponse } from 'next/server';
import { createServerClientSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerClientSupabase();

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      console.error('snapshot:getUser error', authErr);
      return NextResponse.json({ error: 'auth' }, { status: 500 });
    }
    const user = auth.user;
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('id, auth_user_id, email, leaf_total, avatar_url, display_name, handle')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (profErr) {
      console.error('snapshot:profile error', profErr);
      // continue with minimal payload instead of throwing
    }

    const snapshot = {
      profileId: profile?.id ?? null,
      email: user.email ?? profile?.email ?? null,
      leafTotal: profile?.leaf_total ?? 0,
      perks: [] as any[],
      unlocked: {
        fund: false,
        market: false,
      },
    };

    return NextResponse.json(snapshot, { headers: { 'cache-control': 'no-store' } });
  } catch (e) {
    console.error('snapshot route crash', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}