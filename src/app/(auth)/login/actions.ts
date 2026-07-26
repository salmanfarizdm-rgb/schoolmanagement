'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const username = (formData.get('username') as string).trim()
  const password = formData.get('password') as string

  // Teacher uses their real email; parents log in with admission number
  // We store parent auth email as `admissionNo@school.local`
  const email = username.includes('@') ? username : `${username}@school.local`

  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // Determine role and redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profile?.role === 'teacher') {
    redirect('/teacher/dashboard')
  } else {
    redirect('/parent/dashboard')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
