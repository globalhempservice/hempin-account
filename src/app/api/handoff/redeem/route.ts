// src/app/api/handoff/redeem/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/ui/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token =
      (url.searchParams.get("token") || url.searchParams.get("ht") || "").trim();
    const src = (url.searchParams.get("src") || "").trim().toLowerCase();

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Missing handoff token." },
        { status: 400 }
      );
    }

    const db = supabaseAdmin();

    // 1) Fetch handoff token
    const { data: ht, error: htErr } = await db
      .from("handoff_tokens")
      .select("id, profile_id, email, leaf_snapshot, expires_at, consumed_at, metadata")
      .eq("id", token)
      .maybeSingle();

    if (htErr) {
      return NextResponse.json(
        { ok: false, error: `Token lookup failed: ${htErr.message}` },
        { status: 400 }
      );
    }
    if (!ht) {
      return NextResponse.json(
        { ok: false, error: "Token not found." },
        { status: 404 }
      );
    }
    if (ht.consumed_at) {
      // idempotent-ish: still return a success payload so the UX can proceed
      // (but we won’t try to consume again).
    } else if (ht.expires_at && new Date(ht.expires_at) < new Date()) {
      return NextResponse.json(
        { ok: false, error: "Token expired. Please start again." },
        { status: 410 }
      );
    }

    // 2) Get a fresh leaf total from profiles (fallback to snapshot)
    let leafTotal = ht.leaf_snapshot ?? 0;
    if (ht.profile_id) {
      const { data: prof, error: pErr } = await db
        .from("profiles")
        .select("leaf_total, email")
        .eq("id", ht.profile_id)
        .maybeSingle();
      if (!pErr && prof) {
        leafTotal = typeof prof.leaf_total === "number" ? prof.leaf_total : leafTotal;
      }
    }

    // 3) Mark token consumed (best-effort)
    if (!ht.consumed_at) {
      await db
        .from("handoff_tokens")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", token);
    }

    // 4) Decide unlocks
    const fundUnlocked = true;                 // Fund always unlocked on first handoff
    const marketUnlocked = src === "market";   // Unlock Market when the source is Market

    return NextResponse.json({
      ok: true,
      email: ht.email,
      profileId: ht.profile_id,
      leafTotal,
      fundUnlocked,
      marketUnlocked,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}