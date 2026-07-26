'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSpecialClass(formData: FormData) {
  const supabase = await createClient()
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const subject = (formData.get('subject') as string).trim()

  const { error } = await supabase
    .from('special_classes')
    .insert({ date, time, subject })

  if (error) return { error: error.message }
  revalidatePath('/teacher/special-classes')
  revalidatePath('/teacher/dashboard')
  return { error: null }
}

export async function deleteSpecialClass(formData: FormData) {
  const supabase = await createClient()
  const id = parseInt(formData.get('id') as string, 10)

  const { error } = await supabase
    .from('special_classes')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/teacher/special-classes')
  return { error: null }
}
