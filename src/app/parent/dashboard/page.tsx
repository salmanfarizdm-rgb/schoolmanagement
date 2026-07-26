import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export default async function ParentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parent } = await supabase
    .from('parents')
    .select('student_id, students(id, name, gender, status)')
    .eq('id', user.id)
    .single()

  if (!parent) {
    return <p className="text-sm text-gray-500">Parent record not found. Contact the teacher.</p>
  }

  const student = parent.students as { id: string; name: string; gender: string; status: string } | null
  const today = new Date().toISOString().split('T')[0]

  // Today's attendance
  const { data: todayAtt } = await supabase
    .from('attendance')
    .select('period, status, arrival_time')
    .eq('student_id', parent.student_id)
    .eq('date', today)

  // Overall stats
  const { data: allAtt } = await supabase
    .from('attendance')
    .select('status')
    .eq('student_id', parent.student_id)

  const total = allAtt?.length ?? 0
  const present = (allAtt ?? []).filter(r => r.status === 'Present' || r.status === 'Late').length
  const pct = total > 0 ? Math.round((present / total) * 100) : null

  // Pending absence reasons
  const { data: pendingReasons } = await supabase
    .from('attendance')
    .select('id, date, period, status, reason')
    .eq('student_id', parent.student_id)
    .in('status', ['Absent', 'Leave'])
    .is('reason', null)
    .order('date', { ascending: false })
    .limit(3)

  // Upcoming special classes
  const { data: upcoming } = await supabase
    .from('special_classes')
    .select('id, date, time, subject, special_class_confirmations!inner(parent_id)')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(5)

  // Unconfirmed special classes
  const { data: allUpcoming } = await supabase
    .from('special_classes')
    .select('id, date, time, subject')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(5)

  const { data: myConfirmations } = await supabase
    .from('special_class_confirmations')
    .select('special_class_id')
    .eq('parent_id', user.id)

  const confirmedIds = new Set((myConfirmations ?? []).map(c => c.special_class_id))
  const unconfirmed = (allUpcoming ?? []).filter(c => !confirmedIds.has(c.id))

  return (
    <div className="space-y-5">
      {/* Student card */}
      <div className="bg-blue-600 rounded-2xl p-5 text-white">
        <p className="text-xs font-medium opacity-80 uppercase tracking-wide">Student</p>
        <h2 className="text-xl font-bold mt-1">{student?.name}</h2>
        <p className="text-sm opacity-80 mt-0.5">{student?.id} · {student?.gender}</p>
        {pct !== null && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 bg-blue-500 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${pct >= 75 ? 'bg-white' : 'bg-red-300'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-bold">{pct}%</span>
          </div>
        )}
      </div>

      {/* Today */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Today</h2>
        {todayAtt && todayAtt.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {todayAtt.map(a => (
              <div key={a.period} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 capitalize">{a.period}</p>
                  {a.arrival_time && <p className="text-xs text-gray-400">Arrived: {a.arrival_time}</p>}
                </div>
                <Badge label={a.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Attendance not marked yet for today.</p>
        )}
      </section>

      {/* Pending reasons */}
      {(pendingReasons ?? []).length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-2">
            Absence Reasons Needed
          </h2>
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
            {pendingReasons!.map((r, i) => (
              <div key={r.id} className={`flex items-center justify-between px-4 py-3 ${i !== pendingReasons!.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div>
                  <p className="text-sm text-gray-800">{r.date} · <span className="capitalize">{r.period}</span></p>
                  <Badge label={r.status} />
                </div>
                <Link href={`/parent/attendance?highlight=${r.id}`} className="text-xs text-blue-600 underline">
                  Add reason
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Unconfirmed special classes */}
      {unconfirmed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-2">
            Special Classes — Confirm Attendance
          </h2>
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
            {unconfirmed.map((c, i) => (
              <div key={c.id} className={`flex items-center justify-between px-4 py-3 ${i !== unconfirmed.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.subject}</p>
                  <p className="text-xs text-gray-500">{c.date} at {c.time}</p>
                </div>
                <Link href="/parent/special-classes" className="text-xs text-blue-600 underline">
                  Confirm →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
