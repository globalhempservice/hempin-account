import { NextResponse } from 'next/server';

export async function GET() {
  // Supabase sets the auth cookie on the domain from this URL automatically.
  // Just bounce to home (or /welcome for first-time profile setup).
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'https://account.hempin.org'));
}