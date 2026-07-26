import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import ReasonForm from './ReasonForm'

const PAGE_SIZE = 15

export default async function ParentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; highlight?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const page = parseInt(params.page ?? '1', 10)
  const highlight = params.highlight ? parseInt(params.highlight, 10) : null

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: records, count } = await supabase
    .from('attendance')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
    .order('period', { ascending: false })
    .range(from, to)

  // Stats
  const { data: all } = await supabase
    .from('attendance')
    .select('status')

  const total = all?.length ?? 0
  const present = (all ?? []).filter(r => r.status === 'Present' || r.status === 'Late').length
  const absent = (all ?? []).filter(r => r.status === 'Absent').length
  const pct = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Attendance</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-700">{present}</p>
          <p className="text-xs text-green-600">Present</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-red-700">{absent}</p>
          <p className="text-xs text-red-600">Absent</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${pct >= 75 ? 'bg-blue-50' : 'bg-amber-50'}`}>
          <p className={`text-xl font-bold ${pct >= 75 ? 'text-blue-700' : 'text-amber-700'}`}>{pct}%</p>
          <p className={`text-xs ${pct >= 75 ? 'text-blue-600' : 'text-amber-600'}`}>Overall</p>
        </div>
      </div>

      {/* Records */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {(records ?? []).map((r, i) => {
          const isHighlighted = r.id === highlight
          const needsReason = (r.status === 'Absent' || r.status === 'Leave') && !r.reason
          return (
            <div
              key={r.id}
              id={`att-${r.id}`}
              className={`p-4 ${i !== (records?.length ?? 0) - 1 ? 'border-b border-gray-100' : ''} ${isHighlighted ? 'bg-amber-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900">{r.date}</p>
                    <span className="text-xs text-gray-400 capitalize">{r.period}</span>
                    <Badge label={r.status} />
                    {r.arrival_time && (
                      <span className="text-xs text-orange-600">@ {r.arrival_time}</span>
                    )}
                  </div>
                  {r.reason && (
                    <p className="mt-1 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                      Reason: {r.reason}
                    </p>
                  )}
                  {needsReason && (
                    <ReasonForm attendanceId={r.id} />
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {(records ?? []).length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">No attendance records yet.</p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  )
}
