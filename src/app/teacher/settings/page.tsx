import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: setting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'attendance_threshold_pct')
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      <SettingsForm threshold={parseInt(setting?.value ?? '75', 10)} />
    </div>
  )
}
