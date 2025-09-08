import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ ok: false, error: 'Missing email' }, { status: 400 });

    // TODO: integrate an email provider & create a real session.
    // For now: pretend we sent it successfully.
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 });
  }
}
