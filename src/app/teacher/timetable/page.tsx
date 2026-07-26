import { createClient } from '@/lib/supabase/server'
import TimetableGrid from './TimetableGrid'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MAX_PERIODS = 8

export default async function TimetablePage() {
  const supabase = await createClient()
  const { data: slots } = await supabase
    .from('timetable')
    .select('*')
    .order('day_of_week')
    .order('period_number')

  // Build a map: day -> period -> subject
  const grid: Record<number, Record<number, string>> = {}
  for (const slot of slots ?? []) {
    if (!grid[slot.day_of_week]) grid[slot.day_of_week] = {}
    grid[slot.day_of_week][slot.period_number] = slot.subject
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Timetable</h1>
      <p className="text-sm text-gray-500">Click any cell to edit the subject for that period.</p>
      <TimetableGrid grid={grid} days={DAYS} maxPeriods={MAX_PERIODS} />
    </div>
  )
}
