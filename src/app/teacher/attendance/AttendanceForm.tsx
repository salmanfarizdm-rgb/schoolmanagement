'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { upsertAttendance } from './actions'
import { useState, useTransition } from 'react'
import { Pagination } from '@/components/ui/Pagination'

const STATUSES = ['Present', 'Absent', 'Leave', 'Late', 'Half-day'] as const
type Status = typeof STATUSES[number]

interface Student { id: string; name: string; gender: string }

interface Props {
  students: Student[]
  attMap: Record<string, { status: string; arrival_time: string | null }>
  date: string
  period: 'morning' | 'afternoon'
  page: number
  total: number
  pageSize: number
}

const statusColors: Record<string, string> = {
  Present:    'border-green-500 bg-green-50 text-green-700',
  Absent:     'border-red-500 bg-red-50 text-red-700',
  Leave:      'border-yellow-400 bg-yellow-50 text-yellow-700',
  Late:       'border-orange-400 bg-orange-50 text-orange-700',
  'Half-day': 'border-purple-400 bg-purple-50 text-purple-700',
}

export default function AttendanceForm({ students, attMap, date, period, page, total, pageSize }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selections, setSelections] = useState<Record<string, Status>>(() => {
    const init: Record<string, Status> = {}
    for (const s of students) {
      if (attMap[s.id]) init[s.id] = attMap[s.id].status as Status
    }
    return init
  })
  const [arrivals, setArrivals] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const s of students) {
      if (attMap[s.id]?.arrival_time) init[s.id] = attMap[s.id].arrival_time!
    }
    return init
  })
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    p.set(key, value)
    p.delete('page')
    router.push(`${pathname}?${p.toString()}`)
  }

  function markAll(status: Status) {
    const next: Record<string, Status> = {}
    for (const s of students) next[s.id] = status
    setSelections(prev => ({ ...prev, ...next }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false)
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await upsertAttendance(fd)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Date</label>
            <input
              type="date"
              name="date"
              defaultValue={date}
              onChange={e => setParam('date', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Period</label>
            <select
              name="period"
              value={period}
              onChange={e => setParam('period', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
            </select>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center">Mark all:</span>
          {STATUSES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => markAll(s)}
              className="rounded-full border px-3 py-1 text-xs font-medium hover:opacity-80 transition-opacity border-gray-300 text-gray-600"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Student list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {students.map((s, i) => {
          const sel = selections[s.id]
          return (
            <div
              key={s.id}
              className={`p-4 ${i !== students.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.id} · {s.gender}</p>
                </div>
              </div>
              {/* Status chips */}
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map(status => (
                  <label key={status} className="cursor-pointer">
                    <input
                      type="radio"
                      name={`status_${s.id}_${period}`}
                      value={status}
                      checked={sel === status}
                      onChange={() => setSelections(prev => ({ ...prev, [s.id]: status }))}
                      className="sr-only"
                    />
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all
                        ${sel === status
                          ? statusColors[status] + ' ring-2 ring-offset-1 ring-current'
                          : 'border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}
                    >
                      {status}
                    </span>
                  </label>
                ))}
              </div>
              {/* Arrival time for Late */}
              {sel === 'Late' && (
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-gray-500">Arrival time:</label>
                  <input
                    type="time"
                    name={`arrival_${s.id}_${period}`}
                    value={arrivals[s.id] ?? ''}
                    onChange={e => setArrivals(prev => ({ ...prev, [s.id]: e.target.value }))}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )
        })}
        {students.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">No active students found.</p>
        )}
      </div>

      <Pagination page={page} pageSize={pageSize} total={total} />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">Attendance saved.</p>
      )}

      <button
        type="submit"
        disabled={isPending || students.length === 0}
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Saving…' : 'Save Attendance'}
      </button>
    </form>
  )
}
