'use client'

import { useState, useTransition } from 'react'
import { createAnnouncement } from './actions'

export default function AnnouncementForm() {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    const form = e.currentTarget
    startTransition(async () => {
      const r = await createAnnouncement(fd)
      if (r.error) {
        setMsg({ ok: false, text: r.error })
      } else {
        setMsg({ ok: true, text: 'Announcement published.' })
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
        {open ? 'Cancel' : '+ New Announcement'}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          {msg && (
            <p className={`text-xs rounded-lg px-3 py-2 border ${msg.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {msg.text}
            </p>
          )}

          <div>
            <label className="text-xs font-medium text-gray-700">Title</label>
            <input
              name="title"
              required
              placeholder="e.g. School closed on Friday"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Body</label>
            <textarea
              name="body"
              required
              rows={4}
              placeholder="Full announcement text…"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Publishing…' : 'Publish'}
          </button>
        </form>
      )}
    </div>
  )
}
