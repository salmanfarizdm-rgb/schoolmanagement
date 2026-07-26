import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const month = request.nextUrl.searchParams.get('month') // e.g. "2025-07"
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return new NextResponse('Invalid month parameter. Use YYYY-MM format.', { status: 400 })
  }

  const [year, mon] = month.split('-').map(Number)
  const startDate = `${month}-01`
  // Last day of the month: day 0 of next month
  const lastDay = new Date(year, mon, 0).getDate()
  const endDate = `${month}-${String(lastDay).padStart(2, '0')}`

  // Fetch all students for name lookup + attendance records in parallel
  const [{ data: allStudents }, { data: records }] = await Promise.all([
    supabase.from('students').select('id, name'),
    supabase
      .from('attendance')
      .select('student_id, date, period, status, arrival_time, reason')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('student_id')
      .order('date')
      .order('period'),
  ])

  const nameMap: Record<string, string> = {}
  for (const s of allStudents ?? []) nameMap[s.id] = s.name

  // CSV helpers
  const esc = (v: string | null | undefined) =>
    `"${(v ?? '').replace(/"/g, '""')}"`

  const header = ['Student ID', 'Student Name', 'Date', 'Period', 'Status', 'Arrival Time', 'Reason']
  const rows = (records ?? []).map(r => [
    r.student_id,
    nameMap[r.student_id] ?? '',
    r.date,
    r.period,
    r.status,
    r.arrival_time ?? '',
    r.reason ?? '',
  ])

  const csv = [header, ...rows]
    .map(row => row.map(cell => esc(String(cell))).join(','))
    .join('\r\n')

  const filename = `attendance-${month}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
