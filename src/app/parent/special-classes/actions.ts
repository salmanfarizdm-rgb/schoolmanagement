'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function confirmSpecialClass(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const specialClassId = parseInt(formData.get('special_class_id') as string, 10)

  const { error } = await supabase
    .from('special_class_confirmations')
    .insert({ special_class_id: specialClassId, parent_id: user.id })

  if (error && !error.message.includes('duplicate')) return { error: error.message }
  revalidatePath('/parent/special-classes')
  revalidatePath('/parent/dashboard')
  return { error: null }
}
