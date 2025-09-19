import { NextResponse } from 'next/server';
import { createServerClientSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Minimal shape of the row we read from `profiles`
type ProfileRow = {
  id: string;
  email: string | null;
  display_name?: string | null;
  avatar_url: string | null;
  leaf_total: number | null;
  planet_color: string | null;
  unlocked_fund?: boolean | null;
  unlocked_market?: boolean | null;
};

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

    const { data, error } = await supabase
      .from('profiles')
      .select(
        // explicit list so TS knows what we expect
        'id,email,display_name,avatar_url,leaf_total,planet_color,unlocked_fund,unlocked_market'
      )
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Help TS: either a ProfileRow or null
    const profile = (data as ProfileRow | null) ?? null;

    const snapshot = {
      profileId: profile?.id ?? null,
      email: user.email ?? profile?.email ?? null,
      leafTotal: profile?.leaf_total ?? 0,
      perks: [] as any[],
      unlocked: {
        fund: Boolean(profile?.unlocked_fund),
        market: Boolean(profile?.unlocked_market),
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