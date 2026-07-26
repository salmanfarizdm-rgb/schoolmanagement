import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import LeaveForm from './LeaveForm'

const PAGE_SIZE = 10

export default async function ParentLeavePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const page = parseInt(params.page ?? '1', 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: requests, count } = await supabase
    .from('leave_requests')
    .select('*', { count: 'exact' })
    .eq('parent_id', user!.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-lg font-bold text-gray-900">Leave Requests</h1>

      <LeaveForm />

      <div className="space-y-3">
        {(requests ?? []).map(req => (
          <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{req.reason}</p>
                <p className="text-xs text-gray-500 mt-0.5">{req.from_date} → {req.to_date}</p>
                {req.note && <p className="text-xs text-gray-500 italic">{req.note}</p>}
              </div>
              <Badge label={req.status} />
            </div>
            {req.teacher_note && (
              <p className="text-xs bg-gray-50 rounded-lg px-3 py-2 text-gray-600">
                Teacher: {req.teacher_note}
              </p>
            )}
          </div>
        ))}
        {(requests ?? []).length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No leave requests yet.</p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  )
}
