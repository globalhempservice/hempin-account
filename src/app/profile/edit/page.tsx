// src/app/profile/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function EditProfilePage() {
  const supabase = createClient();
  const [uid, setUid] = useState<string | null>(null);
  const [color, setColor] = useState('#60a5fa');
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.replace('/login');
        return;
      }
      setUid(auth.user.id);

      const { data: row } = await supabase
        .from('profiles')
        .select('avatar_url, planet_color')
        .eq('auth_user_id', auth.user.id)
        .maybeSingle();

      if (row?.planet_color) setColor(row.planet_color);
      if (row?.avatar_url) {
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(row.avatar_url);
        if (pub?.publicUrl) setPreview(pub.publicUrl);
      }
    })();
  }, [supabase]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null); setMsg(null);
    const file = e.target.files?.[0];
    if (!file || !uid) return;

    const path = `${uid}/avatar`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: file.type,
    });
    if (error) { setErr(error.message); return; }

    // persist storage path on profile
    const { error: upErr } = await supabase
      .from('profiles')
      .update({ avatar_url: path })
      .eq('auth_user_id', uid);
    if (upErr) { setErr(upErr.message); return; }

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    setPreview(pub?.publicUrl ?? null);
    setMsg('Avatar updated.');
  }

  async function saveColor() {
    if (!uid) return;
    setSaving(true); setErr(null); setMsg(null);
    const { error } = await supabase
      .from('profiles')
      .update({ planet_color: color })
      .eq('auth_user_id', uid);
    setSaving(false);
    if (error) setErr(error.message);
    else setMsg('Color saved.');
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="text-2xl font-semibold">Edit your profile</h1>

        <section className="mt-8 space-y-4">
          <div>
            <div className="text-sm mb-2">Avatar</div>
            {preview ? (
              <img src={preview} alt="avatar" className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-white/10" />
            )}
            <input type="file" accept="image/*" className="mt-3" onChange={onFile} />
            <p className="mt-1 text-xs opacity-60">Square images look best. JPG or PNG.</p>
          </div>

          <div className="mt-6">
            <div className="text-sm mb-2">Planet color</div>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            <button
              onClick={saveColor}
              className="ml-3 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save color'}
            </button>
          </div>

          {msg && <div className="text-sm text-emerald-300">{msg}</div>}
          {err && <div className="text-sm text-red-400">{err}</div>}

          <div className="mt-8">
            <a href="/nebula" className="underline text-sm">Back to Nebula</a>
          </div>
        </section>
      </div>
    </main>
  );
}