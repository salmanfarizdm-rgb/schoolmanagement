import { createClient } from '@/lib/supabase/server'

export default async function ParentExamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: parent } = await supabase
    .from('parents')
    .select('student_id')
    .eq('id', user!.id)
    .single()

  const studentId = parent?.student_id

  const [{ data: exams }, { data: marks }] = await Promise.all([
    supabase.from('exams').select('*').order('date', { ascending: false }),
    studentId
      ? supabase.from('exam_marks').select('*').eq('student_id', studentId)
      : Promise.resolve({ data: [] }),
  ])

  const marksMap = Object.fromEntries(
    (marks ?? []).map(m => [m.exam_id, m])
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Exam Results</h1>

      {(exams ?? []).length === 0 && (
        <p className="text-center text-sm text-gray-400 py-10">No exams scheduled yet.</p>
      )}

      <div className="space-y-3">
        {(exams ?? []).map(exam => {
          const mark = marksMap[exam.id]
          const pct = mark?.marks_obtained != null ? Math.round((mark.marks_obtained / exam.max_marks) * 100) : null

          return (
            <div key={exam.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{exam.subject}</p>
                  <p className="text-xs text-gray-500">{exam.date}{exam.time ? ` at ${exam.time}` : ''}</p>
                </div>
                {mark?.marks_obtained != null ? (
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gray-900">{mark.marks_obtained}<span className="text-xs font-normal text-gray-400">/{exam.max_marks}</span></p>
                    <p className={`text-xs font-medium ${pct! >= 75 ? 'text-green-600' : pct! >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {pct}%
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Marks pending</span>
                )}
              </div>
              {mark?.remarks && (
                <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">{mark.remarks}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
