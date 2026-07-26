const statusStyles: Record<string, string> = {
  Present:    'bg-green-100 text-green-800',
  Absent:     'bg-red-100 text-red-800',
  Leave:      'bg-yellow-100 text-yellow-800',
  Late:       'bg-orange-100 text-orange-800',
  'Half-day': 'bg-purple-100 text-purple-800',
  active:     'bg-green-100 text-green-800',
  inactive:   'bg-gray-100 text-gray-600',
  normal:           'bg-blue-100 text-blue-800',
  public_holiday:   'bg-red-100 text-red-800',
  special_working:  'bg-amber-100 text-amber-800',
}

export function Badge({ label }: { label: string }) {
  const cls = statusStyles[label] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}
