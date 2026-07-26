'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateThreshold(formData: FormData) {
  const supabase = await createClient()
  const value = formData.get('value') as string
  const num = parseInt(value, 10)
  if (isNaN(num) || num < 1 || num > 100) return { error: 'Must be between 1 and 100.' }

  const { error } = await supabase
    .from('settings')
    .update({ value: String(num) })
    .eq('key', 'attendance_threshold_pct')

  if (error) return { error: error.message }
  revalidatePath('/teacher/settings')
  revalidatePath('/teacher/dashboard')
  return { error: null }
}

export async function createTeacherAccount(formData: FormData) {
  const supabase = await createServiceClient()
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'teacher' },
  })

  if (error) return { error: error.message }
  return { error: null, userId: data.user?.id }
}
