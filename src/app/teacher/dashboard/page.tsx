import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

const PAGE_SIZE = 10

export default async function TeacherDashboard({
  searchParams,
}: {
  searchParams: Promise<{ threshold_page?: string }>
}) {
  const params = await searchParams
  const thresholdPage = parseInt(params.threshold_page ?? '1', 10)

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Fetch threshold setting
  const { data: settingRow } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'attendance_threshold_pct')
    .single()
  const threshold = parseInt(settingRow?.value ?? '75', 10)

  // Today's attendance snapshot
  const { data: todayAtt } = await supabase
    .from('attendance')
    .select('status, student_id, period')
    .eq('date', today)

  const studentIds = [...new Set((todayAtt ?? []).map(r => r.student_id))]
  const presentToday = (todayAtt ?? []).filter(r => r.status === 'Present').length
  const absentToday = (todayAtt ?? []).filter(r => r.status === 'Absent').length
  const lateToday = (todayAtt ?? []).filter(r => r.status === 'Late').length

  const { count: totalStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Weekly trend (last 7 days)
  const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]
  const { data: weekData } = await supabase
    .from('attendance')
    .select('date, status')
    .gte('date', weekAgo)
    .lte('date', today)
    .order('date', { ascending: true })

  const weekByDate: Record<string, { present: number; total: number }> = {}
  for (const row of weekData ?? []) {
    weekByDate[row.date] = weekByDate[row.date] ?? { present: 0, total: 0 }
    weekByDate[row.date].total++
    if (row.status === 'Present' || row.status === 'Late') weekByDate[row.date].present++
  }

  // Students below threshold — paginated
  const { data: allStudents } = await supabase
    .from('students')
    .select('id, name')
    .eq('status', 'active')

  const { data: allAtt } = await supabase
    .from('attendance')
    .select('student_id, status')

  const attByStudent: Record<string, { present: number; total: number }> = {}
  for (const row of allAtt ?? []) {
    attByStudent[row.student_id] = attByStudent[row.student_id] ?? { present: 0, total: 0 }
    attByStudent[row.student_id].total++
    if (row.status === 'Present' || row.status === 'Late') attByStudent[row.student_id].present++
  }

  const belowThreshold = (allStudents ?? [])
    .map(s => {
      const stat = attByStudent[s.id]
      if (!stat || stat.total === 0) return null
      const pct = Math.round((stat.present / stat.total) * 100)
      return pct < threshold ? { ...s, pct } : null
    })
    .filter(Boolean) as { id: string; name: string; pct: number }[]

  belowThreshold.sort((a, b) => a.pct - b.pct)
  const thresholdTotal = belowThreshold.length
  const thresholdSlice = belowThreshold.slice(
    (thresholdPage - 1) * PAGE_SIZE,
    thresholdPage * PAGE_SIZE
  )
  const thresholdPages = Math.ceil(thresholdTotal / PAGE_SIZE)

  // Latest special class — who hasn't confirmed
  const { data: latestClass } = await supabase
    .from('special_classes')
    .select('id, date, subject')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  let unconfirmedParents: { id: string; student_id: string }[] = []
  if (latestClass) {
    const { data: confirmations } = await supabase
      .from('special_class_confirmations')
      .select('parent_id')
      .eq('special_class_id', latestClass.id)
    const confirmedIds = new Set((confirmations ?? []).map(c => c.parent_id))

    const { data: allParents } = await supabase
      .from('parents')
      .select('id, student_id')
    unconfirmedParents = (allParents ?? []).filter(p => !confirmedIds.has(p.id))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      {/* Today's snapshot */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Today — {new Date(today).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Students" value={totalStudents ?? 0} color="blue" />
          <StatCard label="Present" value={presentToday} color="green" />
          <StatCard label="Absent" value={absentToday} color="red" />
          <StatCard label="Late" value={lateToday} color="orange" />
        </div>
        {studentIds.length === 0 && (
          <p className="mt-3 text-sm text-gray-500">
            No attendance marked yet today.{' '}
            <Link href="/teacher/attendance" className="text-blue-600 underline">Mark now →</Link>
          </p>
        )}
      </section>

      {/* Weekly trend */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Weekly Trend</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
          <div className="flex items-end gap-3 h-24 min-w-[280px]">
            {Object.entries(weekByDate).map(([date, { present, total }]) => {
              const pct = total > 0 ? Math.round((present / total) * 100) : 0
              const height = Math.max(4, pct)
              const d = new Date(date)
              const label = d.toLocaleDateString('en-GB', { weekday: 'short' })
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium">{pct}%</span>
                  <div
                    className="w-full rounded-t-sm bg-blue-400"
                    style={{ height: `${height}%` }}
                    title={`${date}: ${pct}%`}
                  />
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              )
            })}
            {Object.keys(weekByDate).length === 0 && (
              <p className="text-sm text-gray-400 m-auto">No data yet this week.</p>
            )}
          </div>
        </div>
      </section>

      {/* Below threshold */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Below {threshold}% Attendance ({thresholdTotal})
        </h2>
        {thresholdSlice.length === 0 ? (
          <p className="text-sm text-gray-500">No students below threshold.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {thresholdSlice.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center justify-between px-4 py-3 ${i !== thresholdSlice.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.id}</p>
                </div>
                <Badge label={`${s.pct}%`} />
              </div>
            ))}
          </div>
        )}
        {thresholdPages > 1 && (
          <div className="flex gap-2 mt-2 justify-end">
            {thresholdPage > 1 && (
              <Link href={`/teacher/dashboard?threshold_page=${thresholdPage - 1}`}
                className="text-xs text-blue-600 underline">Prev</Link>
            )}
            <span className="text-xs text-gray-500">{thresholdPage}/{thresholdPages}</span>
            {thresholdPage < thresholdPages && (
              <Link href={`/teacher/dashboard?threshold_page=${thresholdPage + 1}`}
                className="text-xs text-blue-600 underline">Next</Link>
            )}
          </div>
        )}
      </section>

      {/* Unconfirmed special class */}
      {latestClass && unconfirmedParents.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Haven&apos;t Confirmed: {latestClass.subject} on {latestClass.date} ({unconfirmedParents.length})
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {unconfirmedParents.slice(0, PAGE_SIZE).map((p, i) => (
              <div
                key={p.id}
                className={`px-4 py-3 text-sm text-gray-700 ${i !== unconfirmedParents.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                Admission: <span className="font-medium">{p.student_id}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50 text-blue-700',
    green:  'bg-green-50 text-green-700',
    red:    'bg-red-50 text-red-700',
    orange: 'bg-orange-50 text-orange-700',
  }
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  )
}
