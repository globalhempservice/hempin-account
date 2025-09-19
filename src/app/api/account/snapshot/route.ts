// src/app/api/account/snapshot/route.ts
import { NextResponse } from 'next/server';
import { createServerClientSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerClientSupabase();

    // who is signed in?
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // profile row
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select(
        'id, email, leaf_total, avatar_url, planet_color, display_name'
      )
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (pErr) {
      // return minimal snapshot so the UI can degrade gracefully
      return NextResponse.json({
        profileId: null,
        email: user.email ?? null,
        leafTotal: 0,
        perks: [],
        unlocked: {},
        avatarUrl: null,
        planetColor: null,
        displayName: null,
      });
    }

    // build a public URL for the avatar if present
    let avatarUrl: string | null = null;
    if (profile?.avatar_url) {
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
      avatarUrl = pub?.publicUrl ?? null;
    }

    const snapshot = {
      profileId: profile?.id ?? null,
      email: user.email ?? profile?.email ?? null,
      leafTotal: profile?.leaf_total ?? 0,
      perks: [],
      unlocked: {
        // wire these when you start unlocking things
        fund: false,
        market: false,
      },
      avatarUrl,
      planetColor: profile?.planet_color ?? null,
      displayName: profile?.display_name ?? null,
    };

    return NextResponse.json(snapshot, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: 'snapshot-failed' }, { status: 500 });
  }
}