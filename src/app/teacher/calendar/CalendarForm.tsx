'use client'

import { useState, useTransition } from 'react'
import { upsertCalendarDay } from './actions'

export default function CalendarForm() {
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    const form = e.currentTarget
    startTransition(async () => {
      const r = await upsertCalendarDay(fd)
      if (r.error) {
        setMsg({ ok: false, text: r.error })
      } else {
        setMsg({ ok: true, text: 'Calendar updated.' })
        form.reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">Add / Update Day</h2>

      {msg && (
        <p className={`text-xs rounded-lg px-3 py-2 border ${msg.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {msg.text}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-medium text-gray-600">Date</label>
          <input
            type="date"
            name="date"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs font-medium text-gray-600">Type</label>
          <select
            name="type"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="public_holiday">Public Holiday</option>
            <option value="special_working">Special Working</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-600">Label (optional)</label>
          <input
            type="text"
            name="label"
            placeholder="e.g. Eid Al-Fitr"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
