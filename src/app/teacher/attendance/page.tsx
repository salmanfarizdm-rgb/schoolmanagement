import { createClient } from '@/lib/supabase/server'
import AttendanceForm from './AttendanceForm'

function ExportForm({ defaultMonth }: { defaultMonth: string }) {
  return (
    <form method="get" action="/teacher/attendance/export" className="flex items-center gap-2">
      <input
        type="month"
        name="month"
        defaultValue={defaultMonth}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export CSV
      </button>
    </form>
  )
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; period?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]
  const date = params.date ?? today
  const period = (params.period ?? 'morning') as 'morning' | 'afternoon'
  const page = parseInt(params.page ?? '1', 10)
  const PAGE_SIZE = 20

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: students, count } = await supabase
    .from('students')
    .select('id, name, gender', { count: 'exact' })
    .eq('status', 'active')
    .order('name')
    .range(from, to)

  const studentIds = (students ?? []).map(s => s.id)
  const none = ['__none__']

  // Fetch existing attendance + parent WA numbers in parallel
  const [{ data: existing }, { data: parents }] = await Promise.all([
    supabase
      .from('attendance')
      .select('student_id, status, arrival_time, reason')
      .eq('date', date)
      .eq('period', period)
      .in('student_id', studentIds.length ? studentIds : none),
    supabase
      .from('parents')
      .select('student_id, whatsapp_number')
      .in('student_id', studentIds.length ? studentIds : none),
  ])

  const attMap: Record<string, { status: string; arrival_time: string | null; reason: string | null }> = {}
  for (const row of existing ?? []) {
    attMap[row.student_id] = { status: row.status, arrival_time: row.arrival_time, reason: row.reason }
  }

  const waMap: Record<string, string> = {}
  for (const p of parents ?? []) {
    waMap[p.student_id] = p.whatsapp_number ?? ''
  }

  // Default export month = current month
  const currentMonth = today.slice(0, 7) // "YYYY-MM"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-bold text-gray-900">Mark Attendance</h1>
        <ExportForm defaultMonth={currentMonth} />
      </div>
      <AttendanceForm
        students={students ?? []}
        attMap={attMap}
        waMap={waMap}
        date={date}
        period={period}
        page={page}
        total={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  )
}
