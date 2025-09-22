// src/app/api/handoff/redeem/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const token = (url.searchParams.get('token') || url.searchParams.get('ht') || '').trim()
    const src = (url.searchParams.get('src') || '').trim().toLowerCase()

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Missing handoff token.' }, { status: 400 })
    }

    const db = createAdminClient()
    if (!db) {
      // Env not configured in this environment; don’t crash the build/runtime
      return NextResponse.json(
        { ok: false, error: 'Server misconfiguration (no service role key).' },
        { status: 500 }
      )
    }

    // 1) Look up the handoff token
    const { data: ht, error: htErr } = await db
      .from('handoff_tokens')
      .select('id, profile_id, email, leaf_snapshot, expires_at, consumed_at, metadata')
      .eq('id', token)
      .maybeSingle()

    if (htErr) {
      return NextResponse.json(
        { ok: false, error: `Token lookup failed: ${htErr.message}` },
        { status: 400 }
      )
    }
    if (!ht) return NextResponse.json({ ok: false, error: 'Token not found.' }, { status: 404 })
    if (!ht.consumed_at && ht.expires_at && new Date(ht.expires_at) < new Date()) {
      return NextResponse.json({ ok: false, error: 'Token expired. Please start again.' }, { status: 410 })
    }

    // 2) Compute fresh Leaf XP (prefer summing ledger)
    let leafTotal = ht.leaf_snapshot ?? 0
    if (ht.profile_id) {
      try {
        const { data: rows, error: lErr } = await db
          .from('leaf_ledger')
          .select('leaf_delta')
          .eq('profile_id', ht.profile_id)

        if (!lErr && rows) {
          leafTotal = rows.reduce(
            (sum: number, r: { leaf_delta: number | null }) => sum + (r.leaf_delta ?? 0),
            0
          )
        } else {
          const { data: prof } = await db
            .from('profiles')
            .select('leaf_total')
            .eq('id', ht.profile_id)
            .maybeSingle()

          if (prof && typeof prof.leaf_total === 'number') leafTotal = prof.leaf_total
        }
      } catch {
        // keep snapshot value on failure
      }
    }

    // 3) Mark token consumed (best-effort)
    if (!ht.consumed_at) {
      await db.from('handoff_tokens').update({ consumed_at: new Date().toISOString() }).eq('id', token)
    }

    // 4) Decide unlocks
    const fundUnlocked = true
    const marketUnlocked = src === 'market'

    return NextResponse.json({
      ok: true,
      email: ht.email,
      profileId: ht.profile_id,
      leafTotal,
      fundUnlocked,
      marketUnlocked,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 })
  }
}