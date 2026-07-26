'use client'

import { useState, useTransition } from 'react'
import { upsertTimetableSlot, deleteTimetableSlot } from './actions'

interface Props {
  grid: Record<number, Record<number, string>>
  days: string[]
  maxPeriods: number
}

export default function TimetableGrid({ grid, days, maxPeriods }: Props) {
  const [editing, setEditing] = useState<{ day: number; period: number } | null>(null)
  const [value, setValue] = useState('')
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function openCell(day: number, period: number) {
    setEditing({ day, period })
    setValue(grid[day]?.[period] ?? '')
    setMsg(null)
  }

  function handleSave() {
    if (!editing) return
    setMsg(null)
    const fd = new FormData()
    fd.set('day_of_week', String(editing.day))
    fd.set('period_number', String(editing.period))
    fd.set('subject', value.trim())
    startTransition(async () => {
      const r = value.trim()
        ? await upsertTimetableSlot(fd)
        : await deleteTimetableSlot(fd)
      if (r.error) {
        setMsg({ ok: false, text: r.error })
      } else {
        setEditing(null)
      }
    })
  }

  const periods = Array.from({ length: maxPeriods }, (_, i) => i + 1)

  return (
    <>
      {/* Desktop: scrollable grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 w-24">Period</th>
              {days.map((d, i) => (
                <th key={i} className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(p => (
              <tr key={p} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">P{p}</td>
                {days.map((_, di) => {
                  const day = di + 1
                  const subject = grid[day]?.[p]
                  return (
                    <td
                      key={day}
                      onClick={() => openCell(day, p)}
                      className="px-3 py-2 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                    >
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

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xs bg-white rounded-2xl shadow-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">
              {days[editing.day - 1]} — Period {editing.period}
            </h3>

            {msg && (
              <p className={`text-xs rounded-lg px-3 py-2 border ${msg.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {msg.text}
              </p>
            )}

            <div>
              <label className="text-xs font-medium text-gray-600">Subject (leave blank to clear)</label>
              <input
                autoFocus
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                placeholder="e.g. Mathematics"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
