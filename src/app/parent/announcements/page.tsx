import { createClient } from '@/lib/supabase/server'
import { Pagination } from '@/components/ui/Pagination'

const PAGE_SIZE = 10

export default async function ParentAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const page = parseInt(params.page ?? '1', 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: announcements, count } = await supabase
    .from('announcements')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Announcements</h1>

      {(announcements ?? []).map(a => (
        <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">{a.title}</p>
            <p className="text-xs text-gray-400 shrink-0">{new Date(a.created_at).toLocaleDateString()}</p>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.body}</p>
        </div>
      ))}

      {(announcements ?? []).length === 0 && (
        <p className="text-center text-sm text-gray-400 py-10">No announcements yet.</p>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  )
}
