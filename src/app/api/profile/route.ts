// src/app/api/profile/route.ts
import { NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createServerClientSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({} as any))
  const updates = {
    display_name: body.display_name ?? null,
    handle: body.handle ?? null,
    public_email: body.public_email ?? null,
    planet_hue: body.planet_hue ?? null,
    is_public: body.is_public ?? null,
    avatar_url: body.avatar_url ?? null,
  }

  const { error } = await supabase.from('profiles')
    .update(updates)
    .eq('auth_user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}