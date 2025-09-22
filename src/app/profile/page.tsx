// src/app/profile/page.tsx
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/requireUser'
import { createServerClientSupabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  // Server-side guard (redirects to auth.hempin.org if not signed in)
  const user = await requireUser('/profile')

  const supabase = createServerClientSupabase()
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'display_name, handle, public_email, avatar_url, locale, country, timezone, consent_marketing'
    )
    .eq('auth_user_id', user.id)
    .single()

  async function save(formData: FormData) {
    'use server'

    // Always re-create a server client + re-check the user inside the action
    const supa = createServerClientSupabase()
    const {
      data: { user: u },
    } = await supa.auth.getUser()

    if (!u) {
      // Build absolute URL to return to this page, then bounce to auth hub
      const h = headers()
      const host = h.get('x-forwarded-host') || h.get('host')
      const proto =
        h.get('x-forwarded-proto') || (host && host.includes('localhost') ? 'http' : 'https')
      const here = `${proto}://${host}/profile`
      redirect(`https://auth.hempin.org/login?next=${encodeURIComponent(here)}`)
    }

    const updates = {
      display_name: (formData.get('display_name') as string | null) || null,
      handle: (formData.get('handle') as string | null) || null,
      public_email: (formData.get('public_email') as string | null) || null,
      locale: (formData.get('locale') as string | null) || null,
      country: (formData.get('country') as string | null) || null,
      timezone: (formData.get('timezone') as string | null) || null,
      consent_marketing: !!formData.get('consent_marketing'),
    }

    await supa.from('profiles').update(updates).eq('auth_user_id', u!.id)
    // (Optional) You can revalidate this path if you cache elsewhere:
    // revalidatePath('/profile')
  }

  return (
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Edit profile</h1>
      <form action={save} className="space-y-3">
        <input
          name="display_name"
          defaultValue={profile?.display_name ?? ''}
          placeholder="Display name"
          className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
        />
        <input
          name="handle"
          defaultValue={profile?.handle ?? ''}
          placeholder="@handle"
          className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
        />
        <input
          name="public_email"
          defaultValue={profile?.public_email ?? ''}
          placeholder="Public email (optional)"
          className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
        />
        <input
          name="locale"
          defaultValue={profile?.locale ?? ''}
          placeholder="Locale (e.g. en-US)"
          className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
        />
        <input
          name="country"
          defaultValue={profile?.country ?? ''}
          placeholder="Country"
          className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
        />
        <input
          name="timezone"
          defaultValue={profile?.timezone ?? ''}
          placeholder="Timezone"
          className="w-full rounded border border-neutral-700 bg-black px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="consent_marketing"
            defaultChecked={!!profile?.consent_marketing}
          />
          Marketing emails ok
        </label>

        <button className="rounded bg-white/10 px-3 py-2 hover:bg-white/20">Save</button>
      </form>
    </main>
  )
}