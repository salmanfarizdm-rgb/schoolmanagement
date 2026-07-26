import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: settingsRows } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['attendance_threshold_pct', 'academic_year_start', 'academic_year_end'])

  const settings = Object.fromEntries((settingsRows ?? []).map(r => [r.key, r.value]))

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      <SettingsForm
        threshold={parseInt(settings['attendance_threshold_pct'] ?? '75', 10)}
        academicYearStart={settings['academic_year_start'] ?? ''}
        academicYearEnd={settings['academic_year_end'] ?? ''}
      />
    </div>
  )
}
