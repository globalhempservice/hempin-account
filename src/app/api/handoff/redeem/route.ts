import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/ui/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const ht = url.searchParams.get('ht');
    if (!ht) return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });

    const db = supabaseAdmin();
    const { data, error } = await db
      .from('handoff_tokens')
      .select('id, email, campaign_slug, profile_id, expires_at, consumed_at')
      .eq('id', ht)
      .single();

    if (error || !data) return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 404 });
    if (data.consumed_at) return NextResponse.json({ ok: false, error: 'Token already used' }, { status: 400 });
    if (new Date(data.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ ok: false, error: 'Token expired' }, { status: 400 });
    }

    // We do NOT consume the token yet (you asked to consume after session).
    return NextResponse.json({
      ok: true,
      email: data.email,
      campaignSlug: data.campaign_slug,
      fundUnlocked: true,
      profileId: data.profile_id
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 });
  }
}
