'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createExam(formData: FormData) {
  const supabase = await createClient()
  const subject = (formData.get('subject') as string).trim()
  const date = formData.get('date') as string
  const time = (formData.get('time') as string | null) || null
  const max_marks = parseInt(formData.get('max_marks') as string, 10)

  if (!subject || !date || isNaN(max_marks)) return { error: 'All fields are required.' }

  const { data, error } = await supabase.from('exams').insert({ subject, date, time, max_marks }).select('id').single()

  if (error) return { error: error.message }
  revalidatePath('/teacher/exams')
  return { error: null, examId: data?.id }
}

export async function saveMarks(formData: FormData) {
  const supabase = await createClient()
  const exam_id = parseInt(formData.get('exam_id') as string, 10)

  const { data: students } = await supabase.from('students').select('id').eq('status', 'active')

  const records: { exam_id: number; student_id: string; marks_obtained: number | null; remarks: string | null }[] = []

  for (const s of students ?? []) {
    const rawMarks = formData.get(`marks_${s.id}`) as string | null
    const remarks = (formData.get(`remarks_${s.id}`) as string | null)?.trim() || null
    const marks_obtained = rawMarks !== '' && rawMarks !== null ? parseFloat(rawMarks) : null
    records.push({ exam_id, student_id: s.id, marks_obtained, remarks })
  }

  const { error } = await supabase
    .from('exam_marks')
    .upsert(records, { onConflict: 'exam_id,student_id' })

  if (error) return { error: error.message }
  revalidatePath(`/teacher/exams/${exam_id}`)
  return { error: null }
}
