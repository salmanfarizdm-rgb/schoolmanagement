'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  from: string
  to: string
  /** URL param names — defaults to "from" and "to" */
  fromParam?: string
  toParam?: string
  /** Additional params to preserve when updating dates */
  preserveParams?: string[]
}

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    from: monday.toISOString().split('T')[0],
    to: sunday.toISOString().split('T')[0],
  }
}

function getMonthRange() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    from: first.toISOString().split('T')[0],
    to: last.toISOString().split('T')[0],
  }
}

export default function DateRangeFilter({
  from,
  to,
  fromParam = 'from',
  toParam = 'to',
  preserveParams = [],
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function applyRange(newFrom: string, newTo: string) {
    const p = new URLSearchParams()
    // Preserve specified params
    for (const key of preserveParams) {
      const val = searchParams.get(key)
      if (val) p.set(key, val)
    }
    if (newFrom) p.set(fromParam, newFrom)
    if (newTo) p.set(toParam, newTo)
    router.push(`${pathname}?${p.toString()}`)
  }

  const week = getWeekRange()
  const month = getMonthRange()
  const isWeek = from === week.from && to === week.to
  const isMonth = from === month.from && to === month.to

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={from}
        onChange={e => applyRange(e.target.value, to)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-xs text-gray-400">to</span>
      <input
        type="date"
        value={to}
        onChange={e => applyRange(from, e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={() => applyRange(week.from, week.to)}
        className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
          isWeek
            ? 'bg-blue-600 text-white border-blue-600'
            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
        }`}
      >
        This week
      </button>
      <button
        type="button"
        onClick={() => applyRange(month.from, month.to)}
        className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
          isMonth
            ? 'bg-blue-600 text-white border-blue-600'
            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
        }`}
      >
        This month
      </button>
    </div>
  )
}
