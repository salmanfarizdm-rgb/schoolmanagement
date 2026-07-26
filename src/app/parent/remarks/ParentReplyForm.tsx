'use client'

import { useState, useTransition } from 'react'
import { addParentRemarkReply } from './actions'

export default function ParentReplyForm({ remarkId }: { remarkId: number }) {
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!msg.trim()) return
    setErr(null)
    const fd = new FormData()
    fd.set('remark_id', String(remarkId))
    fd.set('message', msg)
    startTransition(async () => {
      const r = await addParentRemarkReply(fd)
      if (r.error) setErr(r.error)
      else setMsg('')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 pt-1 border-t border-gray-100">
      {err && <p className="text-xs text-red-600 w-full">{err}</p>}
      <input
        value={msg}
        onChange={e => setMsg(e.target.value)}
        placeholder="Reply to teacher…"
        className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isPending || !msg.trim()}
        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Reply
      </button>
    </form>
  )
}
