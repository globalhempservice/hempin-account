'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Bootstrap =
  | { ok: true; signedIn: true; user: { id: string; email: string } }
  | { ok: true; signedIn: false; user: null }
  | { ok: false; signedIn: false; error: string };

type Snapshot = {
  avatarUrl: string | null;
  leafTotal: number;
} | null;

function absUrl() {
  try { return new URL(window.location.href).toString(); } catch { return '/'; }
}
function authLoginHref(next?: string) {
  const n = next || absUrl();
  return `https://auth.hempin.org/login?next=${encodeURIComponent(n)}`;
}

export default function Navbar() {
  const [boot, setBoot] = useState<Bootstrap | null>(null);
  const [snap, setSnap] = useState<Snapshot>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  // 1) fetch /api/bootstrap (no-cache)
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetch('/api/bootstrap', { credentials: 'include', cache: 'no-store' });
        const json = (await res.json()) as Bootstrap;
        if (!abort) setBoot(json);
        // 2) if signed in and on account subdomain, fetch snapshot for avatar/leaf
        if (!abort && json.ok && json.signedIn && typeof window !== 'undefined') {
          const isAccount = window.location.hostname.startsWith('account.');
          if (isAccount) {
            try {
              const sres = await fetch('/api/account/snapshot', { credentials: 'include', cache: 'no-store' });
              if (sres.ok) {
                const sjson = await sres.json();
                setSnap({
                  avatarUrl: sjson?.avatarUrl ?? null,
                  leafTotal: typeof sjson?.leafTotal === 'number' ? sjson.leafTotal : 0,
                });
              }
            } catch {}
          }
        }
      } catch {
        if (!abort) setBoot({ ok: false, signedIn: false, error: 'bootstrap_failed' });
      }
    })();
    return () => { abort = true; };
  }, []);

  const signedIn = !!(boot && boot.ok && (boot as any).signedIn);
  const initials = useMemo(() => {
    if (!boot || !('user' in boot) || !boot.user?.email) return '…';
    const email = boot.user.email as string;
    const name = email.split('@')[0] || 'U';
    const a = name[0]?.toUpperCase() ?? 'U';
    const b = name[1]?.toUpperCase() ?? '';
    return `${a}${b}`;
  }, [boot]);

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <a href="/" className="font-semibold tracking-wide">Hempin Account</a>

        {/* Right side */}
        <div ref={menuRef} className="relative">
          {/* Unknown state → small skeleton */}
          {!boot && (
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
          )}

          {/* Visitor */}
          {boot && !signedIn && (
            <a
              href={authLoginHref()}
              className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
            >
              Sign in
            </a>
          )}

          {/* Signed-in */}
          {signedIn && (
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-3 rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10 hover:bg-white/10"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              {/* Leaf pill */}
              {typeof snap?.leafTotal === 'number' && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs">
                  Leaf XP {snap.leafTotal}
                </span>
              )}
              {/* Avatar */}
              {snap?.avatarUrl ? (
                <img
                  src={snap.avatarUrl}
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-white/15"
                />
              ) : (
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs ring-1 ring-white/15">
                  {initials}
                </div>
              )}
            </button>
          )}

          {/* Dropdown */}
          {signedIn && open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 shadow-lg"
            >
              <a
                href="/profile/edit"
                className="block px-3 py-2 text-sm hover:bg-white/10"
                role="menuitem"
              >
                Edit profile
              </a>
              <a
                href="https://wallet.hempin.org"
                className="block px-3 py-2 text-sm hover:bg-white/10"
                role="menuitem"
              >
                My wallet
              </a>
              <a
                href="/logout"
                className="block px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                role="menuitem"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}