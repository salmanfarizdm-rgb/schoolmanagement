'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/database.types'

type AttendanceStatus = Database['public']['Enums']['attendance_status']
type AttendancePeriod = Database['public']['Enums']['attendance_period']

const VALID_STATUSES: AttendanceStatus[] = ['Present', 'Absent', 'Leave', 'Late', 'Half-day']

export async function upsertAttendance(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const date = formData.get('date') as string
  const period = formData.get('period') as AttendancePeriod

  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('status', 'active')

  const records: {
    student_id: string
    date: string
    period: AttendancePeriod
    status: AttendanceStatus
    arrival_time: string | null
    marked_by: string
  }[] = []

  for (const s of students ?? []) {
    const rawStatus = formData.get(`status_${s.id}_${period}`) as string
    if (!rawStatus) continue
    if (!VALID_STATUSES.includes(rawStatus as AttendanceStatus)) continue

    const status = rawStatus as AttendanceStatus
    const arrivalRaw = formData.get(`arrival_${s.id}_${period}`) as string | null

    records.push({
      student_id: s.id,
      date,
      period,
      status,
      arrival_time: status === 'Late' && arrivalRaw ? arrivalRaw : null,
      marked_by: user.id,
    })
  }

  const { error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'student_id,date,period' })

  if (error) return { error: error.message }

  revalidatePath('/teacher/attendance')
  revalidatePath('/teacher/dashboard')
  return { error: null }
}
