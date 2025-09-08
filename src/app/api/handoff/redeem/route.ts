import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/ui/lib/supabaseServer';

async function lookupToken(token: string) {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from('handoff_tokens')
    .select('id, email, campaign_slug, profile_id, expires_at, consumed_at')
    .eq('id', token)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 404 });
  }
  if (data.consumed_at) {
    return NextResponse.json({ ok: false, error: 'Token already used' }, { status: 400 });
  }
  if (new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: 'Token expired' }, { status: 400 });
  }

  // Do NOT consume yet (we’ll consume after the session is established)
  return NextResponse.json({
    ok: true,
    email: data.email,
    campaignSlug: data.campaign_slug,
    fundUnlocked: true,
    profileId: data.profile_id,
  });
}

// GET /api/handoff/redeem?token=...   (preferred)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token =
      (url.searchParams.get('token') || url.searchParams.get('ht') || '').trim();
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });
    }
    return await lookupToken(token);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

// POST /api/handoff/redeem  body: { token: string }   (also supported)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = (body?.token || '').trim();
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });
    }
    return await lookupToken(token);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 });
  }
}