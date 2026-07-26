import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import DateRangeFilter from '@/components/ui/DateRangeFilter'
import StudentActions from './StudentActions'
import CSVImport from './CSVImport'

const PAGE_SIZE = 50

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; from?: string; to?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const page = parseInt(params.page ?? '1', 10)
  const q = params.q?.trim() ?? ''
  const attFrom = params.from ?? ''
  const attTo = params.to ?? ''

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('students')
    .select('id, name, gender, date_of_birth, parent_name, status, parents(id, whatsapp_number, secondary_contact)', { count: 'exact' })
    .order('name')
    .range(from, to)

  if (q) query = query.ilike('name', `%${q}%`)

  const { data: students, count } = await query

  // Per-student attendance totals for this page
  const pageIds = (students ?? []).map(s => s.id)
  let attQuery = supabase
    .from('attendance')
    .select('student_id, status')
    .in('student_id', pageIds.length ? pageIds : ['__none__'])
  if (attFrom) attQuery = attQuery.gte('date', attFrom)
  if (attTo) attQuery = attQuery.lte('date', attTo)
  const { data: attRows } = pageIds.length ? await attQuery : { data: [] }

  type AttStat = { present: number; absent: number; late: number; leave: number; total: number }
  const attMap: Record<string, AttStat> = {}
  for (const row of attRows ?? []) {
    attMap[row.student_id] = attMap[row.student_id] ?? { present: 0, absent: 0, late: 0, leave: 0, total: 0 }
    attMap[row.student_id].total++
    if (row.status === 'Present') attMap[row.student_id].present++
    else if (row.status === 'Absent') attMap[row.student_id].absent++
    else if (row.status === 'Late') attMap[row.student_id].late++
    else if (row.status === 'Leave') attMap[row.student_id].leave++
  }

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

      {/* Attendance date range filter */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">Filter attendance stats by date range:</p>
        <DateRangeFilter
          from={attFrom}
          to={attTo}
          preserveParams={['q', 'page']}
        />
      </div>

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
                    <p className="text-sm font-semibold text-gray-900 break-words">{s.name}</p>
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
                  {/* Attendance summary */}
                  {(() => {
                    const att = attMap[s.id]
                    if (!att || att.total === 0) return null
                    const pct = Math.round(((att.present + att.late) / att.total) * 100)
                    return (
                      <p className="text-xs text-gray-400 mt-1">
                        Att: <span className={pct < 75 ? 'text-red-600 font-semibold' : 'text-green-700 font-medium'}>{pct}%</span>
                        {' · '}P:{att.present} A:{att.absent} L8:{att.late} Lv:{att.leave}
                      </p>
                    )
                  })()}
                </div>
                {parent && (
                  <StudentActions
                    studentId={s.id}
                    studentName={s.name}
                    studentGender={s.gender}
                    studentDob={s.date_of_birth ?? ''}
                    studentParentName={s.parent_name ?? ''}
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
