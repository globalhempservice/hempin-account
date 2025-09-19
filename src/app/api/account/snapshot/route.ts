// src/app/api/account/snapshot/route.ts
import { NextResponse } from 'next/server';
import { createServerClientSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';          // ensure Node (not Edge)
export const dynamic = 'force-dynamic';   // never pre-render
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createServerClientSupabase();

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
    }

    // Pull basic profile fields that power Nebula
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        [
          'id',
          'email',
          'display_name',
          'avatar_url',
          'leaf_total',
          'planet_color',
          // these can be boolean columns you add later; they safely coerce here
          'unlocked_fund',
          'unlocked_market',
        ].join(', ')
      )
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const snapshot = {
      profileId: profile?.id ?? null,
      email: user.email ?? profile?.email ?? null,
      leafTotal: profile?.leaf_total ?? 0,
      perks: [],
      unlocked: {
        fund: Boolean((profile as any)?.unlocked_fund),
        market: Boolean((profile as any)?.unlocked_market),
      },
      avatar_url: profile?.avatar_url ?? null,
      planet_color: profile?.planet_color ?? null,
    };

    return NextResponse.json(snapshot);
  } catch (e: any) {
    console.error('[/api/account/snapshot] crash', e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}