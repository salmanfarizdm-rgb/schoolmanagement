'use client'

import { useState, useTransition } from 'react'
import { createRemark } from './actions'

interface Props {
  students: { id: string; name: string }[]
}

export default function RemarkForm({ students }: Props) {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    const form = e.currentTarget
    startTransition(async () => {
      const r = await createRemark(fd)
      if (r.error) {
        setMsg({ ok: false, text: r.error })
      } else {
        setMsg({ ok: true, text: 'Remark added.' })
        form.reset()
        setOpen(false)
      }
    })
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {open ? 'Cancel' : '+ New Remark'}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          {msg && (
            <p className={`text-xs rounded-lg px-3 py-2 border ${msg.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {msg.text}
            </p>
          )}

          <div>
            <label className="text-xs font-medium text-gray-700">Student</label>
            <select
              name="student_id"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select student…</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Severity</label>
            <select
              name="severity"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Describe the incident…"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save Remark'}
          </button>
        </form>
      )}
    </div>
  )
}
