import { createClient } from '@/lib/supabase/server'
import AttendanceForm from './AttendanceForm'

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

  // Fetch existing attendance for this date+period
  const studentIds = (students ?? []).map(s => s.id)
  const { data: existing } = await supabase
    .from('attendance')
    .select('student_id, status, arrival_time')
    .eq('date', date)
    .eq('period', period)
    .in('student_id', studentIds.length ? studentIds : ['__none__'])

  const attMap: Record<string, { status: string; arrival_time: string | null }> = {}
  for (const row of existing ?? []) {
    attMap[row.student_id] = { status: row.status, arrival_time: row.arrival_time }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Mark Attendance</h1>
      <AttendanceForm
        students={students ?? []}
        attMap={attMap}
        date={date}
        period={period}
        page={page}
        total={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  )
}
