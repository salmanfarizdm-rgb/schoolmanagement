'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reviewLeaveRequest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const id = parseInt(formData.get('id') as string, 10)
  const status = formData.get('status') as 'approved' | 'rejected'
  const teacher_note = (formData.get('teacher_note') as string | null)?.trim() ?? null

  if (!['approved', 'rejected'].includes(status)) return { error: 'Invalid status.' }

  const { error } = await supabase
    .from('leave_requests')
    .update({ status, teacher_note, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  // If approved, upsert attendance rows for each day in the range
  if (status === 'approved') {
    const { data: req } = await supabase
      .from('leave_requests')
      .select('student_id, from_date, to_date')
      .eq('id', id)
      .single()

    if (req) {
      const records: { student_id: string; date: string; period: 'morning' | 'afternoon'; status: 'Leave'; marked_by: string }[] = []
      const from = new Date(req.from_date)
      const to = new Date(req.to_date)
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const date = d.toISOString().split('T')[0]
        for (const period of ['morning', 'afternoon'] as const) {
          records.push({ student_id: req.student_id, date, period, status: 'Leave', marked_by: user.id })
        }
      }
      await supabase
        .from('attendance')
        .upsert(records, { onConflict: 'student_id,date,period' })
    }
  }

  revalidatePath('/teacher/leaves')
  return { error: null }
}
