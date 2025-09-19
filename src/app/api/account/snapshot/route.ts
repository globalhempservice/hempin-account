// server-only
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/ui/lib/supabaseServer';

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, email, avatar_url, planet_hue, leaf_total, is_public')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  // Market unlock: any role row → unlocked
  const { count: marketCount } = await supabase
    .from('market_roles')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profile?.id ?? '');

  return NextResponse.json({
    email: user.email ?? profile?.email ?? null,
    profileId: profile?.id ?? null,
    displayName: profile?.display_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    planetHue: profile?.planet_hue ?? 210,
    leafTotal: profile?.leaf_total ?? 0,
    isPublic: profile?.is_public ?? false,
    unlocked: { market: (marketCount ?? 0) > 0, fund: false },
  });
}