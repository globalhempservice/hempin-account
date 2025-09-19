import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/ui/lib/supabaseServer';

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('profiles')
    .select('id, auth_user_id, display_name, avatar_url, planet_hue, locale, country, timezone, is_public, handle, email, public_email')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? {});
}

export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const patch = {
    auth_user_id: user.id,
    display_name: body.display_name ?? null,
    avatar_url: body.avatar_url ?? null,
    planet_hue: typeof body.planet_hue === 'number' ? Math.max(0, Math.min(360, body.planet_hue)) : undefined,
    locale: body.locale ?? null,
    country: body.country ?? null,
    timezone: body.timezone ?? null,
    is_public: typeof body.is_public === 'boolean' ? body.is_public : undefined,
    handle: body.handle ?? null,
    public_email: body.public_email ?? null,
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(patch, { onConflict: 'auth_user_id' })
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}