import { createClient } from '@/lib/supabase/server'
import { Pagination } from '@/components/ui/Pagination'
import Link from 'next/link'
import ExamForm from './ExamForm'

const PAGE_SIZE = 15

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const page = parseInt(params.page ?? '1', 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: exams, count } = await supabase
    .from('exams')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
    .range(from, to)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Exams</h1>

      <ExamForm />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {(exams ?? []).map((exam, i) => (
          <div
            key={exam.id}
            className={`flex items-center justify-between p-4 ${i !== (exams?.length ?? 0) - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{exam.subject}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {exam.date}{exam.time ? ` at ${exam.time}` : ''} · Max: {exam.max_marks}
              </p>
            </div>
            <Link
              href={`/teacher/exams/${exam.id}`}
              className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Enter Marks
            </Link>
          </div>
        ))}
        {(exams ?? []).length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">No exams yet.</p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  )
}
