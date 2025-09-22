// src/app/profile/edit/page.tsx
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/requireUser'
import { createServerClientSupabase } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export const dynamic = 'force-dynamic'

export default async function EditProfilePage() {
  // Guard: must be signed in (send back here after auth)
  const user = await requireUser('/profile/edit')

  const supabase = createServerClientSupabase()
  const { data: initial } = await supabase
    .from('profiles')
    .select('display_name, handle, public_email, planet_hue, is_public, avatar_url')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-semibold">Edit your profile</h1>
        <section className="mt-6">
          <ProfileForm initial={initial ?? {}} />
        </section>
        <div className="mt-10 flex items-center justify-between">
          <a href="/nebula" className="underline text-sm">Back to Nebula</a>
        </div>
      </div>
    </main>
  )
}