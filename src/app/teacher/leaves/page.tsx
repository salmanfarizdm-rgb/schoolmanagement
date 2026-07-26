import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import DateRangeFilter from '@/components/ui/DateRangeFilter'
import LeaveReviewForm from './LeaveReviewForm'

const PAGE_SIZE = 15

export default async function LeavesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; from?: string; to?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const page = parseInt(params.page ?? '1', 10)
  const filterStatus = params.status ?? 'pending'
  const filterFrom = params.from ?? ''
  const filterTo = params.to ?? ''
  const offset = (page - 1) * PAGE_SIZE
  const offsetTo = offset + PAGE_SIZE - 1

  let query = supabase
    .from('leave_requests')
    .select('*, students(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offsetTo)

  if (filterStatus !== 'all') query = query.eq('status', filterStatus)
  if (filterFrom) query = query.gte('from_date', filterFrom)
  if (filterTo) query = query.lte('from_date', filterTo)

  // Summary analytics — fetch all leave requests (no pagination)
  const [{ data: requests, count }, { data: allLeaves }] = await Promise.all([
    query,
    supabase
      .from('leave_requests')
      .select('id, student_id, from_date, status, students(name)'),
  ])

  const totalPending = (allLeaves ?? []).filter(r => r.status === 'pending').length
  const totalAll = (allLeaves ?? []).length

  // Per-student frequency
  const byStudent: Record<string, { name: string; count: number }> = {}
  for (const r of allLeaves ?? []) {
    const student = Array.isArray(r.students) ? r.students[0] : r.students
    const name = student?.name ?? r.student_id
    byStudent[r.student_id] = byStudent[r.student_id] ?? { name, count: 0 }
    byStudent[r.student_id].count++
  }
  const topApplicants = Object.entries(byStudent)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Day-of-week pattern (0=Sun … 6=Sat)
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const byDay: number[] = Array(7).fill(0)
  for (const r of allLeaves ?? []) {
    if (r.from_date) {
      const dow = new Date(r.from_date + 'T00:00:00').getDay()
      byDay[dow]++
    }
  }
  const maxDay = Math.max(...byDay, 1)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Leave Requests</h1>

      {/* Summary stats */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-2xl font-bold text-amber-700">{totalPending}</p>
          <p className="text-xs font-medium text-amber-600 mt-0.5">Pending review</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-2xl font-bold text-gray-700">{totalAll}</p>
          <p className="text-xs font-medium text-gray-500 mt-0.5">Total all time</p>
        </div>
      </section>

      {totalAll > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Top applicants */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Most Frequent</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {topApplicants.map((s, i) => (
                <div key={s.id} className={`flex items-center justify-between px-4 py-2.5 ${i !== topApplicants.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.id}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{s.count}×</span>
                </div>
              ))}
            </div>
          </section>

          {/* Day-of-week pattern */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Leave Start Day</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-end gap-1.5 h-20">
                {DAY_NAMES.map((d, i) => {
                  const h = byDay[i] === 0 ? 2 : Math.round((byDay[i] / maxDay) * 100)
                  return (
                    <div key={d} className="flex-1 flex flex-col items-center gap-1">
                      {byDay[i] > 0 && <span className="text-[10px] text-gray-500">{byDay[i]}</span>}
                      <div
                        className={`w-full rounded-t-sm ${byDay[i] === maxDay && maxDay > 0 ? 'bg-amber-400' : 'bg-blue-200'}`}
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[10px] text-gray-400">{d}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Date range filter */}
      <DateRangeFilter
        from={filterFrom}
        to={filterTo}
        preserveParams={['status']}
      />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <a
            key={s}
            href={`?status=${s}${filterFrom ? `&from=${filterFrom}` : ''}${filterTo ? `&to=${filterTo}` : ''}`}
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
