import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import LeaveReviewForm from './LeaveReviewForm'

const PAGE_SIZE = 15

export default async function LeavesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const page = parseInt(params.page ?? '1', 10)
  const filterStatus = params.status ?? 'pending'
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('leave_requests')
    .select('*, students(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filterStatus !== 'all') query = query.eq('status', filterStatus)

  const { data: requests, count } = await query

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Leave Requests</h1>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <a
            key={s}
            href={`?status=${s}`}
            className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize border transition-colors
              ${filterStatus === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            {s}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {(requests ?? []).map(req => {
          const student = Array.isArray(req.students) ? req.students[0] : req.students
          return (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{student?.name ?? req.student_id}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {req.from_date} → {req.to_date}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">{req.reason}</p>
                  {req.note && <p className="text-xs text-gray-500 italic mt-1">Note: {req.note}</p>}
                </div>
                <Badge label={req.status} />
              </div>

              {req.teacher_note && (
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  Teacher note: {req.teacher_note}
                </p>
              )}

              {req.status === 'pending' && (
                <LeaveReviewForm leaveId={req.id} />
              )}
            </div>
          )
        })}
        {(requests ?? []).length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">No {filterStatus} leave requests.</p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  )
}
