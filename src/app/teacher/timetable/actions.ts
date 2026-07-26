'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertTimetableSlot(formData: FormData) {
  const supabase = await createClient()
  const day_of_week = parseInt(formData.get('day_of_week') as string, 10)
  const period_number = parseInt(formData.get('period_number') as string, 10)
  const subject = (formData.get('subject') as string).trim()

  if (!subject) return { error: 'Subject is required.' }

  const { error } = await supabase
    .from('timetable')
    .upsert({ day_of_week, period_number, subject }, { onConflict: 'day_of_week,period_number' })

  if (error) return { error: error.message }
  revalidatePath('/teacher/timetable')
  revalidatePath('/parent/timetable')
  return { error: null }
}

export async function deleteTimetableSlot(formData: FormData) {
  const supabase = await createClient()
  const day_of_week = parseInt(formData.get('day_of_week') as string, 10)
  const period_number = parseInt(formData.get('period_number') as string, 10)

  const { error } = await supabase
    .from('timetable')
    .delete()
    .eq('day_of_week', day_of_week)
    .eq('period_number', period_number)

  if (error) return { error: error.message }
  revalidatePath('/teacher/timetable')
  revalidatePath('/parent/timetable')
  return { error: null }
}
