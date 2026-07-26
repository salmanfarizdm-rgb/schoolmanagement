'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReason(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify this attendance record belongs to the parent's child (RLS enforces this too)
  const { data: parent } = await supabase
    .from('parents')
    .select('student_id')
    .eq('id', user.id)
    .single()

  const attendanceId = parseInt(formData.get('attendance_id') as string, 10)
  const reason = (formData.get('reason') as string).trim()

  const { error } = await supabase
    .from('attendance')
    .update({ reason })
    .eq('id', attendanceId)
    .eq('student_id', parent?.student_id ?? '')

  if (error) return { error: error.message }
  revalidatePath('/parent/attendance')
  revalidatePath('/parent/dashboard')
  return { error: null }
}
