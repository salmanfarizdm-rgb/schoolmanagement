'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addParentRemarkReply(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const remark_id = parseInt(formData.get('remark_id') as string, 10)
  const message = (formData.get('message') as string).trim()
  if (!message) return { error: 'Reply cannot be empty.' }

  const { error } = await supabase.from('remark_replies').insert({
    remark_id,
    message,
    author_id: user.id,
    author_role: 'parent',
  })

  if (error) return { error: error.message }
  revalidatePath('/parent/remarks')
  return { error: null }
}
