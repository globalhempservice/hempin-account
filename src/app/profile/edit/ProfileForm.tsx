// src/app/profile/edit/ProfileForm.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ProfileForm({ initial }: { initial: any }) {
  const supabase = createClient();

  // store the STORAGE PATH in DB, and keep a preview URL locally
  const [avatarPath, setAvatarPath] = useState<string | null>(initial.avatar_url ?? null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initial.avatar_url_preview ?? initial.avatar_url ?? null);

  const [displayName, setDisplayName] = useState(initial.display_name ?? '');
  const [handle, setHandle] = useState(initial.handle ?? '');
  const [publicEmail, setPublicEmail] = useState(initial.public_email ?? '');
  const [planetHue, setPlanetHue] = useState<number>(initial.planet_hue ?? 210);
  const [isPublic, setIsPublic] = useState<boolean>(!!initial.is_public);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onUploadAvatar(file: File) {
    setErr(null); setMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr('Not signed in'); return; }

    // immediate local preview
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    // pick a stable path (no extension needed, but ok to keep)
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${user.id}/avatar.${ext}`;

    const { error: upErr } = await supabase
      .storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg', cacheControl: '3600' });

    if (upErr) { setErr(upErr.message); return; }

    // set storage path for DB write
    setAvatarPath(path);

    // get public URL for preview only
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarPreview(pub?.publicUrl ?? localUrl);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(null); setMsg(null);

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        display_name: displayName,
        handle,
        public_email: publicEmail,
        planet_hue: planetHue,
        is_public: isPublic,
        // IMPORTANT: store the storage path, not the preview URL
        avatar_url: avatarPath,
      }),
    });

    setSaving(false);
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(payload.error || 'Save failed'); return; }
    setMsg('Saved!');
  }

  return (
    <form onSubmit={onSave} className="mt-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-white/10 overflow-hidden ring-1 ring-white/10">
          {avatarPreview ? <img src={avatarPreview} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <label className="text-sm">
          <span className="block mb-1 opacity-70">Avatar</span>
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && onUploadAvatar(e.target.files[0])} />
        </label>
      </div>

      <label className="block">
        <div className="text-sm opacity-70">Display name</div>
        <input className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
               value={displayName} onChange={e => setDisplayName(e.target.value)} />
      </label>

      <label className="block">
        <div className="text-sm opacity-70">Handle (for directory)</div>
        <input className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
               value={handle} onChange={e => setHandle(e.target.value)} placeholder="e.g. paul-iglesias" />
      </label>

      <label className="block">
        <div className="text-sm opacity-70">Public contact email (optional)</div>
        <input className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
               value={publicEmail} onChange={e => setPublicEmail(e.target.value)} />
      </label>

      <label className="block">
        <div className="text-sm opacity-70 mb-1">Planet color</div>
        <div className="flex items-center gap-3">
          <input type="range" min={0} max={360} value={planetHue}
                 onChange={e => setPlanetHue(Number(e.target.value))}
                 className="w-full" />
          <div className="h-6 w-6 rounded-full ring-1 ring-white/10"
               style={{ background: `hsl(${planetHue} 70% 55%)` }} />
        </div>
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        <span className="text-sm">Make profile public (visible on directory)</span>
      </label>

      <div className="pt-1 flex items-center gap-3">
        <button disabled={saving}
                className="rounded-md bg-white/90 text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-60">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {msg && <span className="text-emerald-300 text-sm">{msg}</span>}
        {err && <span className="text-red-400 text-sm">{err}</span>}
      </div>
    </form>
  );
}