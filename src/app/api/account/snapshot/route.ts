// src/app/api/account/snapshot/route.ts
import { NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClientSupabase()

    // 1) Session / user
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      const res = NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      res.headers.set('Pragma', 'no-cache')
      res.headers.set('Vary', 'Cookie')
      return res
    }

    // 2) Profile (minimal fields the client actually needs)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, leaf_total, avatar_url, planet_color')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    // 3) Public avatar URL, if any
    let avatarUrl: string | null = null
    if (profile?.avatar_url) {
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url)
      avatarUrl = pub?.publicUrl ?? null
    }

    // 4) Unlocked universes
    const { data: uu } = await supabase
      .from('user_universes')
      .select('key')
      .eq('auth_user_id', user.id)

    const unlockedSet = new Set((uu ?? []).map((r: any) => r.key))

    // 5) Assemble compact snapshot
    const body = {
      ok: true as const,
      user: { id: user.id, email: user.email ?? profile?.email ?? null },
      profile: {
        id: profile?.id ?? null,
        leafTotal: profile?.leaf_total ?? 0,
        avatarUrl,
        planetColor: profile?.planet_color ?? null,
      },
      unlocked: {
        fund: true,                       // flip to gated if needed later
        market: unlockedSet.has('market'),
      },
    }

    const res = NextResponse.json(body)
    // Absolutely no caching & vary on Cookie so per-user state never leaks
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    res.headers.set('Pragma', 'no-cache')
    res.headers.set('Vary', 'Cookie')
    return res
  } catch {
    const res = NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    res.headers.set('Pragma', 'no-cache')
    res.headers.set('Vary', 'Cookie')
    return res
  }
}