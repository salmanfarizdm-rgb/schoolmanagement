import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import CalendarForm from './CalendarForm'

const PAGE_SIZE = 15

const TYPE_LABELS: Record<string, string> = {
  normal: 'Normal',
  public_holiday: 'Public Holiday',
  special_working: 'Special Working',
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const page = parseInt(params.page ?? '1', 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: days, count } = await supabase
    .from('calendar')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
    .range(from, to)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">School Calendar</h1>

      <CalendarForm />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {(days ?? []).map((d, i) => (
          <div
            key={d.date}
            className={`flex items-center justify-between p-4 ${i !== (days?.length ?? 0) - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                {d.date}
                {d.label && <span className="ml-2 text-gray-500">— {d.label}</span>}
              </p>
              <Badge label={d.type} />
            </div>
            <form>
              <input type="hidden" name="date" value={d.date} />
              <button
                type="submit"
                formAction={async (fd) => {
                  'use server'
                  const { deleteCalendarDay } = await import('./actions')
                  await deleteCalendarDay(fd)
                }}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </form>
          </div>
        ))}
        {(days ?? []).length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">No calendar entries yet.</p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  )
}
