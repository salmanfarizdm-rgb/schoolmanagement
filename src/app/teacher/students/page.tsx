import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import StudentActions from './StudentActions'
import CSVImport from './CSVImport'

const PAGE_SIZE = 15

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const page = parseInt(params.page ?? '1', 10)
  const q = params.q?.trim() ?? ''

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('students')
    .select('id, name, gender, status, parents(id, whatsapp_number, secondary_contact)', { count: 'exact' })
    .order('name')
    .range(from, to)

  if (q) query = query.ilike('name', `%${q}%`)

  const { data: students, count } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Students</h1>
        <CSVImport />
      </div>

      {/* Search */}
      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Search
        </button>
      </form>

      {/* Student list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {(students ?? []).map((s, i) => {
          const parent = Array.isArray(s.parents) ? s.parents[0] : s.parents
          return (
            <div
              key={s.id}
              className={`p-4 ${i !== (students?.length ?? 0) - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                    <Badge label={s.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.id} · {s.gender}</p>
                  {parent ? (
                    <p className="text-xs text-gray-500 mt-1">
                      WA: {parent.whatsapp_number ?? <span className="text-amber-600">Not set</span>}
                      {parent.secondary_contact && ` · Alt: ${parent.secondary_contact}`}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-1">No parent account</p>
                  )}
                </div>
                {parent && (
                  <StudentActions
                    studentId={s.id}
                    studentName={s.name}
                    studentGender={s.gender}
                    studentStatus={s.status}
                    parentId={parent.id}
                    whatsapp={parent.whatsapp_number ?? ''}
                    secondary={parent.secondary_contact ?? ''}
                  />
                )}
              </div>
            </div>
          )
        })}
        {(students ?? []).length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">
            {q ? 'No students match your search.' : 'No students yet. Import a CSV to get started.'}
          </p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  )
}
