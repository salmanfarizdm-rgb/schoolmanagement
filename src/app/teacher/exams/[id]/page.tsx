import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MarksForm from './MarksForm'

export default async function ExamMarksPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: exam }, { data: students }, { data: existingMarks }] = await Promise.all([
    supabase.from('exams').select('*').eq('id', parseInt(id, 10)).single(),
    supabase.from('students').select('id, name').eq('status', 'active').order('name'),
    supabase.from('exam_marks').select('*').eq('exam_id', parseInt(id, 10)),
  ])

  if (!exam) notFound()

  const marksMap = Object.fromEntries(
    (existingMarks ?? []).map(m => [m.student_id, { marks: m.marks_obtained, remarks: m.remarks }])
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{exam.subject}</h1>
        <p className="text-sm text-gray-500">{exam.date}{exam.time ? ` at ${exam.time}` : ''} · Max: {exam.max_marks}</p>
      </div>

      <MarksForm exam={exam} students={students ?? []} marksMap={marksMap} />
    </div>
  )
}
