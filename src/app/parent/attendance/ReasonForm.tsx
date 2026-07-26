'use client'

import { useState, useTransition } from 'react'
import { submitReason } from './actions'

export default function ReasonForm({ attendanceId }: { attendanceId: number }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setMsg(null)
    startTransition(async () => {
      const r = await submitReason(fd)
      if (r.error) {
        setMsg({ ok: false, text: r.error })
      } else {
        setMsg({ ok: true, text: 'Reason submitted.' })
        setOpen(false)
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-1.5 text-xs text-blue-600 underline"
      >
        Add reason for absence
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <input type="hidden" name="attendance_id" value={attendanceId} />
      {msg && (
        <p className={`text-xs rounded px-2 py-1 ${msg.ok ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
          {msg.text}
        </p>
      )}
      <textarea
        name="reason"
        required
        placeholder="Reason for absence (e.g. sick, family matter…)"
        rows={2}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Submitting…' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
