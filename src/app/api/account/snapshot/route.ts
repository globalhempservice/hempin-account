import { NextResponse } from 'next/server';
import { createServerClientSupabase } from '@/lib/supabase/server'; // keep this import name if your helper exports it

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerClientSupabase();

    // 1) Auth guard
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      console.error('snapshot:getUser error', authErr);
      return NextResponse.json({ error: 'auth' }, { status: 500 });
    }
    const user = auth.user;
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // 2) Read profile. Select only safe, known columns.
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select(
        // keep this list in sync with your table; avoid selecting unknown columns
        'id, auth_user_id, email, leaf_total, avatar_url, display_name, handle'
      )
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (profErr) {
      // Do not throw; return a 200 with minimal snapshot so the UI still renders
      console.error('snapshot:profile error', profErr);
    }

    // 3) Build the snapshot payload without assuming profile exists
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

    return NextResponse.json(snapshot, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (e) {
    console.error('snapshot route crash', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}