'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/database.types'

type CalendarDayType = Database['public']['Enums']['calendar_day_type']

export async function upsertCalendarDay(formData: FormData) {
  const supabase = await createClient()
  const date = formData.get('date') as string
  const type = formData.get('type') as CalendarDayType

  const { error } = await supabase
    .from('calendar')
    .upsert({ date, type }, { onConflict: 'date' })

  if (error) return { error: error.message }
  revalidatePath('/teacher/calendar')
  return { error: null }
}

export async function deleteCalendarDay(formData: FormData) {
  const supabase = await createClient()
  const date = formData.get('date') as string

  const { error } = await supabase
    .from('calendar')
    .delete()
    .eq('date', date)

  if (error) return { error: error.message }
  revalidatePath('/teacher/calendar')
  return { error: null }
}
