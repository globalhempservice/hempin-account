// src/app/logout/route.ts
import { redirect } from 'next/navigation'
import { createServerClientSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClientSupabase()
    await supabase.auth.signOut()
  } finally {
    // always redirect back to site root after logout
    redirect('/')
  }
}