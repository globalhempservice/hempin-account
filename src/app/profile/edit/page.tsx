'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ProfileBasics, SocialLink } from '@/app/nebula/lib/types';

type State = {
  real_name: string;
  display_name: string;
  bio: string;
  country: string;
  role: string;
  links: SocialLink[];
  avatar_url: string | null;   // storage path
  planet_color: string;        // hex
  avatarPreview: string | null; // public url (or local preview)
};

const fallbackState: State = {
  real_name: '',
  display_name: '',
  bio: '',
  country: '',
  role: '',
  links: [],
  avatar_url: null,
  planet_color: '#60a5fa',
  avatarPreview: null,
};

const COUNTRY_OPTIONS = [
  'United States', 'France', 'United Kingdom', 'Germany', 'Italy', 'Spain',
  'Portugal', 'Switzerland', 'Canada', 'Brazil', 'Mexico', 'Japan', 'Korea',
  'India', 'Australia', 'New Zealand', 'South Africa', 'Other',
];

export default function EditProfilePage() {
  const supabase = createClient();
  const [uid, setUid] = useState<string | null>(null);
  const [state, setState] = useState<State>(fallbackState);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveTick, setSaveTick] = useState<number>(0);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // Load current
  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { window.location.replace('/login'); return; }
      setUid(auth.user.id);

      const { data } = await supabase
        .from('profiles')
        .select('real_name, display_name, bio, country, role, links, avatar_url, planet_color')
        .eq('auth_user_id', auth.user.id)
        .maybeSingle<ProfileBasics>();

      if (data) {
        // avatar public url (if any)
        let preview: string | null = null;
        if (data.avatar_url) {
          const { data: pub } = supabase.storage.from('avatars').getPublicUrl(data.avatar_url);
          preview = pub?.publicUrl ?? null;
        }
        setState({
          real_name: data.real_name ?? '',
          display_name: data.display_name ?? '',
          bio: data.bio ?? '',
          country: data.country ?? '',
          role: data.role ?? '',
          links: Array.isArray(data.links) ? (data.links as SocialLink[]) : [],
          avatar_url: data.avatar_url ?? null,
          planet_color: data.planet_color ?? '#60a5fa',
          avatarPreview: preview,
        });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced auto-save whenever state changes (except avatarPreview)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!uid) return;
    // Don’t auto-save while uploading avatar
    if (uploading) return;

    setSaving(true);
    setErr(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase.from('profiles').update({
          real_name: state.real_name || null,
          display_name: state.display_name || null,
          bio: state.bio || null,
          country: state.country || null,
          role: state.role || null,
          links: state.links ?? [],
          avatar_url: state.avatar_url || null,
          planet_color: state.planet_color || null,
        }).eq('auth_user_id', uid);

        if (error) throw error;
        setSavedAt(Date.now());
        setSaveTick(t => t + 1);
        setSaving(false);
      } catch (e: any) {
        setErr(e?.message || 'Could not save changes');
        setSaving(false);
      }
    }, 500);
  }, [uid, state.real_name, state.display_name, state.bio, state.country, state.role, state.links, state.avatar_url, state.planet_color, uploading, supabase]);

  // Avatar upload (immediate local preview + upload + update row)
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uid) return;
    setErr(null);
    setUploading(true);

    // instant local preview
    const objectUrl = URL.createObjectURL(file);
    setState(s => ({ ...s, avatarPreview: objectUrl }));

    try {
      const path = `${uid}/avatar`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, {
        upsert: true, cacheControl: '3600', contentType: file.type,
      });
      if (error) throw error;

      // public url and persist storage path in state (auto-save will update the row)
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      setState(s => ({ ...s, avatar_url: path, avatarPreview: pub?.publicUrl ?? objectUrl }));
    } catch (e: any) {
      setErr(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  // Helpers to update fields
  const setField = <K extends keyof State>(key: K) =>
    (v: State[K]) => setState(s => ({ ...s, [key]: v }));

  const savedLabel = useMemo(() => {
    if (saving) return 'Saving…';
    if (!savedAt) return '—';
    return 'Saved';
  }, [saving, savedAt, saveTick]);

  // links editor helpers
  function addLink() {
    setState(s => ({ ...s, links: [...s.links, { type: 'website', url: '' }] }));
  }
  function removeLink(i: number) {
    setState(s => ({ ...s, links: s.links.filter((_, idx) => idx !== i) }));
  }
  function updateLink(i: number, next: Partial<SocialLink>) {
    setState(s => ({
      ...s,
      links: s.links.map((lnk, idx) => idx === i ? { ...lnk, ...next } : lnk),
    }));
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Edit your profile</h1>
          <div className="text-xs opacity-70">{savedLabel}</div>
        </header>

        {/* Avatar + Color */}
        <section className="mt-6 grid grid-cols-[auto,1fr] gap-5 items-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full ring-1 ring-white/10 overflow-hidden bg-white/5">
              {state.avatarPreview ? (
                <img src={state.avatarPreview} alt="avatar" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <label className="mt-2 inline-flex items-center gap-2 text-xs cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              <span className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 hover:bg-white/15">
                {uploading ? 'Uploading…' : (state.avatarPreview ? 'Change' : 'Upload avatar')}
              </span>
            </label>
          </div>

          <div>
            <div className="text-sm mb-1">Planet color</div>
            <input
              type="color"
              value={state.planet_color}
              onChange={(e) => setField('planet_color')(e.target.value)}
            />
          </div>
        </section>

        {/* Names */}
        <section className="mt-8 grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm opacity-80">Display name / Nickname</label>
            <input
              className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2"
              placeholder="e.g. Hemp Explorer"
              value={state.display_name}
              onChange={(e) => setField('display_name')(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm opacity-80">Real name (optional)</label>
            <input
              className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2"
              placeholder="Your real/legal name"
              value={state.real_name}
              onChange={(e) => setField('real_name')(e.target.value)}
            />
          </div>
        </section>

        {/* Bio */}
        <section className="mt-6">
          <label className="text-sm opacity-80">Bio</label>
          <textarea
            className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 min-h-[90px]"
            placeholder="Tell the hemp world about you…"
            maxLength={300}
            value={state.bio}
            onChange={(e) => setField('bio')(e.target.value)}
          />
          <div className="mt-1 text-xs opacity-60">{state.bio.length}/300</div>
        </section>

        {/* Country + Role */}
        <section className="mt-6 grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm opacity-80">Country</label>
            <select
              className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2"
              value={state.country}
              onChange={(e) => setField('country')(e.target.value)}
            >
              <option value="">Select…</option>
              {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm opacity-80">Role</label>
            <input
              className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2"
              placeholder="e.g. Researcher, Brand, Farmer…"
              value={state.role}
              onChange={(e) => setField('role')(e.target.value)}
            />
          </div>
        </section>

        {/* Links */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Links</h2>
            <button
              onClick={addLink}
              className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
            >
              Add link
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {state.links.map((lnk, i) => (
              <div key={i} className="grid grid-cols-[140px,1fr,auto] gap-2 items-center">
                <select
                  className="rounded border border-white/10 bg-white/5 px-2 py-2 text-sm"
                  value={lnk.type}
                  onChange={(e) => updateLink(i, { type: e.target.value as SocialLink['type'] })}
                >
                  <option value="website">Website</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="x">X / Twitter</option>
                  <option value="custom">Custom</option>
                </select>
                <input
                  className="rounded border border-white/10 bg-white/5 px-3 py-2"
                  placeholder="https://…"
                  value={lnk.url}
                  onChange={(e) => updateLink(i, { url: e.target.value })}
                />
                <button
                  onClick={() => removeLink(i)}
                  className="rounded border border-white/10 bg-white/5 px-2 py-2 text-sm hover:bg-white/10"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
            {state.links.length === 0 && (
              <div className="text-sm opacity-60">No links yet.</div>
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-10 flex items-center justify-between">
          <a href="/nebula" className="underline text-sm">Back to Nebula</a>
          {err && <div className="text-sm text-red-400">{err}</div>}
        </div>
      </div>
    </main>
  );
}