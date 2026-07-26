import { createClient } from '@/lib/supabase/server'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MAX_PERIODS = 8

export default async function ParentTimetablePage() {
  const supabase = await createClient()
  const { data: slots } = await supabase
    .from('timetable')
    .select('*')
    .order('day_of_week')
    .order('period_number')

  const grid: Record<number, Record<number, string>> = {}
  for (const slot of slots ?? []) {
    if (!grid[slot.day_of_week]) grid[slot.day_of_week] = {}
    grid[slot.day_of_week][slot.period_number] = slot.subject
  }

  const periods = Array.from({ length: MAX_PERIODS }, (_, i) => i + 1)

  // Find max period with any content
  const usedPeriods = periods.filter(p =>
    DAYS.some((_, di) => grid[di + 1]?.[p])
  )
  const displayPeriods = usedPeriods.length > 0 ? usedPeriods : periods

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Timetable</h1>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 w-16">Period</th>
              {DAYS.map(d => (
                <th key={d} className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayPeriods.map(p => (
              <tr key={p} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">P{p}</td>
                {DAYS.map((_, di) => {
                  const subject = grid[di + 1]?.[p]
                  return (
                    <td key={di} className="px-3 py-2 text-center">
                      {subject
                        ? <span className="text-xs font-medium text-gray-800">{subject}</span>
                        : <span className="text-xs text-gray-300">—</span>
                      }
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(slots ?? []).length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">Timetable not set up yet.</p>
      )}
    </div>
  )
}
