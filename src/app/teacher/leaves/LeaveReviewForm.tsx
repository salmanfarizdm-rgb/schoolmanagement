'use client'

import { useState, useTransition } from 'react'
import { reviewLeaveRequest } from './actions'

export default function LeaveReviewForm({ leaveId }: { leaveId: number }) {
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit(status: 'approved' | 'rejected') {
    setMsg(null)
    const fd = new FormData()
    fd.set('id', String(leaveId))
    fd.set('status', status)
    fd.set('teacher_note', note)
    startTransition(async () => {
      const r = await reviewLeaveRequest(fd)
      if (r.error) setMsg({ ok: false, text: r.error })
      // On success the page revalidates, no need to set ok message
    })
  }

  return (
    <div className="space-y-2 pt-1 border-t border-gray-100">
      {msg && (
        <p className={`text-xs rounded-lg px-3 py-2 border ${msg.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {msg.text}
        </p>
      )}
      <input
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Optional note to parent…"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button
          onClick={() => submit('approved')}
          disabled={isPending}
          className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => submit('rejected')}
          disabled={isPending}
          className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  )
}
