// src/app/api/bootstrap/route.ts
import { NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerClientSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()

  const body = error
    ? { ok: false as const, signedIn: false as const, error: error.message }
    : user
    ? { ok: true as const, signedIn: true as const, user: { id: user.id, email: user.email } }
    : { ok: true as const, signedIn: false as const, user: null }

  const res = NextResponse.json(body)

  // absolutely no caching — Navbar/session UI must reflect reality
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  res.headers.set('Pragma', 'no-cache')
  res.headers.set('Vary', 'Cookie')

  return res
}