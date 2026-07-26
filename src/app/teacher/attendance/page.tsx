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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Mark Attendance</h1>
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
