// src/app/profile/edit/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type ProfileRow = {
  auth_user_id: string;
  display_name: string | null;
  handle: string | null;
  public_email: string | null;
  locale: string | null;
  country: string | null;
  timezone: string | null;
  avatar_url: string | null;    // storage path (e.g. "uid/avatar.png")
  planet_color: string | null;  // hex color
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function EditProfilePage() {
  const supabase = createClient();

  const [uid, setUid] = useState<string | null>(null);
  const [row, setRow] = useState<ProfileRow | null>(null);

  // View state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Debounce timer for autosave
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // bootstrap: load user + profile
  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.replace('/login');
        return;
      }
      setUid(auth.user.id);

      // fetch profile row
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(
          'auth_user_id, display_name, handle, public_email, locale, country, timezone, avatar_url, planet_color'
        )
        .eq('auth_user_id', auth.user.id)
        .maybeSingle();

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Ensure a row exists (in case it wasn't created yet)
      if (!profile) {
        const empty: Omit<ProfileRow, 'auth_user_id'> = {
          display_name: null,
          handle: null,
          public_email: null,
          locale: null,
          country: null,
          timezone: null,
          avatar_url: null,
          planet_color: '#60a5fa',
        };
        const { data: inserted, error: upErr } = await supabase
          .from('profiles')
          .insert({ ...empty, auth_user_id: auth.user.id })
          .select('*')
          .single();

        if (upErr) {
          setErrorMsg(upErr.message);
          return;
        }
        setRow(inserted as ProfileRow);
      } else {
        setRow(profile as ProfileRow);
      }

      // preload public avatar if exists
      const path = profile?.avatar_url;
      if (path) {
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
        if (pub?.publicUrl) setAvatarPreview(pub.publicUrl);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // helpers

  function scheduleAutosave(next: Partial<ProfileRow>) {
    if (!row || !uid) return;
    const updated: ProfileRow = { ...row, ...next };

    // Local UI update first (optimistic)
    setRow(updated);
    setSaveState('saving');
    setErrorMsg(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const payload: Partial<ProfileRow> = { ...next };
        // never allow changing auth_user_id
        delete (payload as any).auth_user_id;

        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('auth_user_id', uid);

        if (error) {
          setSaveState('error');
          setErrorMsg(error.message);
        } else {
          setSaveState('saved');
          // tiny delay before going back to idle
          setTimeout(() => setSaveState('idle'), 1000);
        }
      } catch (e: any) {
        setSaveState('error');
        setErrorMsg(e?.message ?? 'Failed to save');
      }
    }, 650);
  }

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    if (!uid) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // show instant preview
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setUploading(true);
    setUploadPct(0);
    setErrorMsg(null);

    // a pseudo-progress while upload runs (supabase-js doesn't provide progress)
    const p = setInterval(() => {
      setUploadPct((prev) => (prev < 90 ? prev + 5 : prev));
    }, 120);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${uid}/avatar.${ext}`;

      // upsert = true ensures replacement on re-upload
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type });

      if (upErr) throw upErr;

      // persist path to profile
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: path })
        .eq('auth_user_id', uid);

      if (dbErr) throw dbErr;

      // swap to the actual public URL
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      if (pub?.publicUrl) setAvatarPreview(pub.publicUrl);

      setUploadPct(100);
      setTimeout(() => setUploading(false), 400);
    } catch (err: any) {
      setUploading(false);
      setUploadPct(0);
      setErrorMsg(err?.message ?? 'Avatar upload failed');
    } finally {
      clearInterval(p);
    }
  }

  // derived
  const color = useMemo(
    () => (row?.planet_color && isHex(row.planet_color) ? row.planet_color : '#60a5fa'),
    [row?.planet_color]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // UI

  return (
    <main className="min-h-screen px-5 py-5 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Header saveState={saveState} />

        {/* Avatar + color */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/* Planet avatar */}
            <div className="relative h-24 w-24 shrink-0 rounded-full ring-1 ring-white/10 overflow-hidden"
                 style={{
                   background: `radial-gradient(110% 110% at 30% 30%, ${withAlpha(color, 0.65)} 0%, ${withAlpha(color, 0.35)} 45%, rgba(255,255,255,0.04) 80%)`
                 }}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="absolute inset-0 h-full w-full object-cover opacity-90 mix-blend-luminosity"
                />
              ) : (
                <div className="absolute inset-0 opacity-10" />
              )}

              {/* subtle gloss */}
              <div className="pointer-events-none absolute inset-0"
                   style={{ background: 'radial-gradient(60% 50% at 28% 22%, rgba(255,255,255,.25), rgba(255,255,255,0) 60%)' }} />
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium">Avatar</div>
              <p className="mt-1 text-xs opacity-70">Square images look best. JPG/PNG. Replacing an avatar will overwrite the previous one.</p>

              <div className="mt-3 flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15">
                  <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
                  Upload image
                </label>

                <div className="flex items-center gap-2 text-xs">
                  {uploading ? (
                    <>
                      <span className="opacity-80">Uploading…</span>
                      <Progress value={uploadPct} />
                    </>
                  ) : null}
                </div>
              </div>

              <div className="mt-5">
                <div className="text-sm font-medium">Planet color</div>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => scheduleAutosave({ planet_color: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0"
                  />
                  <span className="text-xs opacity-70">{color.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Basics */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <h2 className="text-sm font-medium">Basics</h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Display name"
              value={row?.display_name ?? ''}
              onChange={(v) => scheduleAutosave({ display_name: v })}
              placeholder="Your name"
            />
            <Field
              label="Handle"
              prefix="@"
              value={row?.handle ?? ''}
              onChange={(v) => scheduleAutosave({ handle: v })}
              placeholder="username"
            />
            <Field
              label="Public email"
              type="email"
              value={row?.public_email ?? ''}
              onChange={(v) => scheduleAutosave({ public_email: v })}
              placeholder="optional"
            />
            <Field
              label="Locale"
              value={row?.locale ?? ''}
              onChange={(v) => scheduleAutosave({ locale: v })}
              placeholder="e.g. en-US"
            />
            <Field
              label="Country"
              value={row?.country ?? ''}
              onChange={(v) => scheduleAutosave({ country: v })}
              placeholder="Country"
            />
            <Field
              label="Timezone"
              value={row?.timezone ?? ''}
              onChange={(v) => scheduleAutosave({ timezone: v })}
              placeholder="e.g. Europe/Paris"
            />
          </div>
        </section>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between">
          <a href="/nebula" className="text-sm underline opacity-80 hover:opacity-100">Back to Nebula</a>
          {errorMsg ? <span className="text-xs text-red-400">{errorMsg}</span> : null}
        </div>
      </div>
    </main>
  );
}

/* ───────────────────────────── UI bits ───────────────────────────── */

function Header({ saveState }: { saveState: SaveState }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Edit your profile</h1>
      <SaveBadge state={saveState} />
    </div>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  if (state === 'saving') return <Badge>Saving…</Badge>;
  if (state === 'saved') return <Badge className="bg-emerald-600/25 border-emerald-500/40">Saved</Badge>;
  if (state === 'error') return <Badge className="bg-red-600/20 border-red-500/40">Error</Badge>;
  return <span className="text-xs opacity-0">.</span>; // keep layout stable
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs ${className}`}>
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs mb-1 opacity-80">{label}</div>
      <div className="flex items-stretch">
        {prefix ? (
          <span className="inline-flex items-center rounded-l-md border border-white/10 bg-white/5 px-2 text-sm opacity-80">
            {prefix}
          </span>
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${prefix ? 'rounded-r-md' : 'rounded-md'} border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20`}
        />
      </div>
    </label>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div aria-label="upload progress" className="h-2 w-28 rounded bg-white/10 overflow-hidden">
      <div
        className="h-full bg-white/80 transition-[width] duration-200"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* ───────────────────────────── utils ───────────────────────────── */

function isHex(v?: string | null) {
  if (!v) return false;
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
}

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const short = h.length === 3;
  const r = parseInt(short ? h[0] + h[0] : h.slice(0, 2), 16);
  const g = parseInt(short ? h[1] + h[1] : h.slice(2, 4), 16);
  const b = parseInt(short ? h[2] + h[2] : h.slice(4, 6), 16);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}