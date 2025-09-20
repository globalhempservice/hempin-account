import { NextRequest, NextResponse } from 'next/server'

// Supabase sets cookies via our server client cookie hooks.
// We just redirect the user back to where they started (if provided).
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const returnTo = url.searchParams.get('returnTo')

  const fallback = process.env.NEXT_PUBLIC_BASE_URL || 'https://account.hempin.org'
  const dest =
    returnTo && /^https:\/\/[a-z0-9.-]*hempin\.org(\/|$)/i.test(returnTo)
      ? returnTo
      : `${fallback}/nebula`

  return NextResponse.redirect(dest)
}