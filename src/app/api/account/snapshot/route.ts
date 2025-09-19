import { NextResponse } from 'next/server';
import { createServerClientSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClientSupabase();

    // 1) Authed user
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // 2) Profile row
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, leaf_total, avatar_url, planet_color')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    // 3) Public avatar URL (if set)
    let avatarUrl: string | null = null;
    if (profile?.avatar_url) {
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
      avatarUrl = pub?.publicUrl ?? null;
    }

    // 4) Assemble snapshot
    const snapshot = {
      profileId: profile?.id ?? null,
      email: user.email ?? profile?.email ?? null,
      leafTotal: profile?.leaf_total ?? 0,
      perks: [] as any[],
      unlocked: {
        fund: false,
        market: false,
      },
      avatarUrl,
      planetColor: profile?.planet_color ?? null,
    };

    return NextResponse.json(snapshot);
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}