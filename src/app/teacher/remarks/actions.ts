'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRemark(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const student_id = formData.get('student_id') as string
  const description = (formData.get('description') as string).trim()
  const severity = formData.get('severity') as string

  if (!description || !student_id) return { error: 'All fields are required.' }

  const { error } = await supabase.from('remarks').insert({
    student_id,
    description,
    severity,
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/teacher/remarks')
  return { error: null }
}

export async function addRemarkReply(formData: FormData) {
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
    author_role: 'teacher',
  })

  if (error) return { error: error.message }
  revalidatePath('/teacher/remarks')
  return { error: null }
}
