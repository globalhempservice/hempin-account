import { NextResponse } from 'next/server';
import { createServerClientSupabase } from '@/lib/supabase/server';

export async function POST() {
  const supabase = createServerClientSupabase();

  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // already unlocked?
  const { data: existing } = await supabase
    .from('user_universes')
    .select('key')
    .eq('auth_user_id', user.id)
    .eq('key', 'market')
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ newlyUnlocked: false });
  }

  // unlock + award XP (+1) atomically-ish
  const { error: insErr } = await supabase
    .from('user_universes')
    .insert({ auth_user_id: user.id, key: 'market' });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });

  // bump leaf_total (ignore errors quietly)
  await supabase.rpc('sql', {}); // noop if you had a RPC; using an update instead:
  await supabase
    .from('profiles')
    .update({ leaf_total: (await getLeaf(supabase, user.id)) + 1 })
    .eq('auth_user_id', user.id);

  return NextResponse.json({ newlyUnlocked: true });
}

// helper to read current leaf_total safely
async function getLeaf(supabase: any, uid: string): Promise<number> {
  const { data } = await supabase
    .from('profiles')
    .select('leaf_total')
    .eq('auth_user_id', uid)
    .maybeSingle();
  return data?.leaf_total ?? 0;
}