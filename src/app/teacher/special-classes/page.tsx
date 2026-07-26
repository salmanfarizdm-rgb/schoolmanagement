import { createClient } from '@/lib/supabase/server'
import { Pagination } from '@/components/ui/Pagination'
import SpecialClassForm from './SpecialClassForm'

const PAGE_SIZE = 10

export default async function SpecialClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const page = parseInt(params.page ?? '1', 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: classes, count } = await supabase
    .from('special_classes')
    .select('*, special_class_confirmations(count)', { count: 'exact' })
    .order('date', { ascending: false })
    .range(from, to)

  const { count: parentCount } = await supabase
    .from('parents')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Special Classes</h1>

      <SpecialClassForm />

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {(classes ?? []).map((c, i) => {
          const confirmed = (c.special_class_confirmations as { count: number }[])?.[0]?.count ?? 0
          const total = parentCount ?? 0
          return (
            <div
              key={c.id}
              className={`p-4 ${i !== (classes?.length ?? 0) - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{c.subject}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.date} at {c.time}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Confirmed: <span className={confirmed === total ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                      {confirmed}/{total}
                    </span>
                  </p>
                </div>
                <DeleteClassButton id={c.id} />
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

function DeleteClassButton({ id }: { id: number }) {
  return (
    <form>
      <input type="hidden" name="id" value={id} />
      {/* Using a client wrapper would be ideal, but a simple formAction works here */}
      <button
        type="submit"
        formAction={async (fd) => {
          'use server'
          const { deleteSpecialClass } = await import('./actions')
          await deleteSpecialClass(fd)
        }}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  )
}
