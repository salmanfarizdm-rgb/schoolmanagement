import { createClient } from '@/lib/supabase/server'
import { Pagination } from '@/components/ui/Pagination'
import AnnouncementForm from './AnnouncementForm'

const PAGE_SIZE = 10

export default async function AnnouncementsPage({
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
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Announcements</h1>

      <AnnouncementForm />

      <div className="space-y-3">
        {(announcements ?? []).map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <form>
                <input type="hidden" name="id" value={a.id} />
                <button
                  type="submit"
                  formAction={async (fd) => {
                    'use server'
                    const { deleteAnnouncement } = await import('./actions')
                    await deleteAnnouncement(fd)
                  }}
                  className="shrink-0 rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </form>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.body}</p>
          </div>
        ))}
        {(announcements ?? []).length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">No announcements yet.</p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  )
}
