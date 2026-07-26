'use client'

import { useState, useTransition } from 'react'
import { submitLeaveRequest } from './actions'

export default function LeaveForm() {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    const form = e.currentTarget
    startTransition(async () => {
      const r = await submitLeaveRequest(fd)
      if (r.error) {
        setMsg({ ok: false, text: r.error })
      } else {
        setMsg({ ok: true, text: 'Leave request submitted.' })
        form.reset()
        setOpen(false)
      }
    })
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
      >
        {open ? 'Cancel' : '+ New Leave Request'}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          {msg && (
            <p className={`text-xs rounded-lg px-3 py-2 border ${msg.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {msg.text}
            </p>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700">From date</label>
              <input
                type="date"
                name="from_date"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700">To date</label>
              <input
                type="date"
                name="to_date"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Reason</label>
            <input
              name="reason"
              required
              placeholder="e.g. Family vacation"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Additional note (optional)</label>
            <textarea
              name="note"
              rows={2}
              placeholder="Any extra details…"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      )}
    </div>
  )
}
