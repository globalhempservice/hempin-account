// src/app/api/bootstrap/route.ts
import { NextResponse } from 'next/server'
import { createServerClientSupabase } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerClientSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()

  const res = NextResponse.json(
    user ? { ok: true, signedIn: true, user: { id: user.id, email: user.email } }
         : { ok: true, signedIn: false, user: null }
  )
  // kill all caching so the navbar can’t get stale
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  res.headers.set('Pragma', 'no-cache')
  res.headers.set('Vary', 'Cookie')
  return res
}