import { NextResponse } from 'next/server';

export async function GET() {
  // Supabase sets the auth cookie on this redirect domain automatically.
  // After email confirmation / OAuth return, land on the Nebula.
  return NextResponse.redirect(new URL('/nebula', process.env.NEXT_PUBLIC_BASE_URL || 'https://account.hempin.org'));
}