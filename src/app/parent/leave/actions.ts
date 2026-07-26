'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitLeaveRequest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // Get parent's student_id
  const { data: parent } = await supabase
    .from('parents')
    .select('student_id')
    .eq('id', user.id)
    .single()

  if (!parent) return { error: 'Parent record not found.' }

  const from_date = formData.get('from_date') as string
  const to_date = formData.get('to_date') as string
  const reason = (formData.get('reason') as string).trim()
  const note = (formData.get('note') as string | null)?.trim() || null

  if (!from_date || !to_date || !reason) return { error: 'Please fill all required fields.' }
  if (to_date < from_date) return { error: 'End date must be on or after start date.' }

  const { error } = await supabase.from('leave_requests').insert({
    student_id: parent.student_id,
    parent_id: user.id,
    from_date,
    to_date,
    reason,
    note,
  })

  if (error) return { error: error.message }
  revalidatePath('/parent/leave')
  return { error: null }
}
