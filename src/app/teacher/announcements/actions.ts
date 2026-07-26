'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAnnouncement(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const title = (formData.get('title') as string).trim()
  const body = (formData.get('body') as string).trim()

  if (!title || !body) return { error: 'Title and body are required.' }

  const { error } = await supabase.from('announcements').insert({
    title,
    body,
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/teacher/announcements')
  revalidatePath('/parent/announcements')
  return { error: null }
}

export async function deleteAnnouncement(formData: FormData) {
  const supabase = await createClient()
  const id = parseInt(formData.get('id') as string, 10)

  const { error } = await supabase.from('announcements').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/teacher/announcements')
  revalidatePath('/parent/announcements')
  return { error: null }
}
