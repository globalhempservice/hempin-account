import { NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'

function strOrNull(v: unknown) {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t.length ? t : null
}

export async function POST(req: Request) {
  const supabase = createServerClientSupabase()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({} as Record<string, unknown>))

  // Build a sanitized payload — do NOT include `email` at all.
  const updates: Record<string, unknown> = {
    display_name: strOrNull(body.display_name),
    handle:       strOrNull(body.handle),
    public_email: strOrNull(body.public_email),
    planet_hue:   typeof body.planet_hue === 'number' ? body.planet_hue : null,
    is_public:    !!body.is_public,
    avatar_url:   strOrNull(body.avatar_url), // storage path, not public URL
  }

  // Drop undefined keys so we don't overwrite with undefined
  Object.keys(updates).forEach((k) => {
    if (typeof updates[k] === 'undefined') delete updates[k]
  })

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('auth_user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}