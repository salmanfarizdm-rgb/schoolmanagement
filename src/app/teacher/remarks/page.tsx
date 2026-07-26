import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import RemarkForm from './RemarkForm'
import ReplyForm from './ReplyForm'

const PAGE_SIZE = 10

export default async function RemarksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; student_id?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const page = parseInt(params.page ?? '1', 10)
  const filterStudent = params.student_id ?? ''
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const [{ data: students }, remarkRes] = await Promise.all([
    supabase.from('students').select('id, name').eq('status', 'active').order('name'),
    supabase
      .from('remarks')
      .select('*, students(name), remark_replies(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
      .then(r => filterStudent
        ? supabase
            .from('remarks')
            .select('*, students(name), remark_replies(*)', { count: 'exact' })
            .eq('student_id', filterStudent)
            .order('created_at', { ascending: false })
            .range(from, to)
        : r
      ),
  ])

  const { data: remarks, count } = remarkRes

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Disciplinary Remarks</h1>

      <RemarkForm students={students ?? []} />

      {/* Filter by student */}
      <form method="get" className="flex gap-2">
        <select
          name="student_id"
          defaultValue={filterStudent}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All students</option>
          {(students ?? []).map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Filter
        </button>
      </form>

      <div className="space-y-4">
        {(remarks ?? []).map(remark => {
          const student = Array.isArray(remark.students) ? remark.students[0] : remark.students
          const replies = Array.isArray(remark.remark_replies) ? remark.remark_replies : []
          return (
            <div key={remark.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{student?.name ?? remark.student_id}</p>
                  <p className="text-xs text-gray-500">{new Date(remark.created_at).toLocaleDateString()}</p>
                </div>
                <Badge label={remark.severity} />
              </div>
              <p className="text-sm text-gray-700">{remark.description}</p>

              {replies.length > 0 && (
                <div className="space-y-2 border-t border-gray-100 pt-2">
                  {replies.map((r: { id: number; author_role: string; message: string; created_at: string }) => (
                    <div key={r.id} className={`rounded-lg px-3 py-2 text-xs ${r.author_role === 'teacher' ? 'bg-blue-50 text-blue-800' : 'bg-gray-50 text-gray-700'}`}>
                      <span className="font-medium capitalize">{r.author_role}:</span> {r.message}
                    </div>
                  ))}
                </div>
              )}

              <ReplyForm remarkId={remark.id} />
            </div>
          )
        })}
        {(remarks ?? []).length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">No remarks yet.</p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  )
}
