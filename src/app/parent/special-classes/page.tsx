import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Pagination } from '@/components/ui/Pagination'
import ConfirmButton from './ConfirmButton'

const PAGE_SIZE = 10

export default async function ParentSpecialClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const page = parseInt(params.page ?? '1', 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: classes, count } = await supabase
    .from('special_classes')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
    .range(from, to)

  const { data: myConfirmations } = await supabase
    .from('special_class_confirmations')
    .select('special_class_id, confirmed_at')
    .eq('parent_id', user.id)

  const confirmedMap: Record<number, string> = {}
  for (const c of myConfirmations ?? []) {
    confirmedMap[c.special_class_id] = c.confirmed_at
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Special Classes</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {(classes ?? []).map((c, i) => {
          const confirmed = confirmedMap[c.id]
          const isPast = c.date < today
          return (
            <div
              key={c.id}
              className={`p-4 ${i !== (classes?.length ?? 0) - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{c.subject}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.date} at {c.time}
                    {isPast && <span className="ml-2 text-gray-400">(past)</span>}
                  </p>
                  {confirmed && (
                    <p className="text-xs text-green-600 mt-1">
                      Confirmed on {new Date(confirmed).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {!confirmed && !isPast && (
                  <ConfirmButton specialClassId={c.id} />
                )}
                {confirmed && (
                  <span className="shrink-0 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    Confirmed
                  </span>
                )}
              </div>
            </div>
          )
        })}
        {(classes ?? []).length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">No special classes scheduled.</p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  )
}
