// src/app/profile/edit/page.tsx
import { requireUser } from '@/lib/auth/requireUser'
import ProfileForm from './ProfileForm'

export const dynamic = 'force-dynamic'

export default async function EditProfilePage() {
  // Server-side guard: if not signed in, redirects to auth.hempin.org with ?next
  await requireUser('/profile/edit')

  // Render the client form (it can keep using the browser Supabase client internally)
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Edit your profile</h1>
          {/* The form shows its own save status */}
        </header>

        <section className="mt-6">
          <ProfileForm />
        </section>

        <div className="mt-10 flex items-center justify-between">
          <a href="/nebula" className="underline text-sm">Back to Nebula</a>
        </div>
      </div>
    </main>
  )
}