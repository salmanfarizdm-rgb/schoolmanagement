'use client'

import { useTransition, useState } from 'react'
import { confirmSpecialClass } from './actions'

export default function ConfirmButton({ specialClassId }: { specialClassId: number }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const r = await confirmSpecialClass(fd)
      if (r.error) setError(r.error)
    })
  }

  return (
    <form onSubmit={handleConfirm} className="shrink-0">
      <input type="hidden" name="special_class_id" value={specialClassId} />
      {error && <p className="text-xs text-red-600 mb-1">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-all"
      >
        {isPending ? '…' : 'Confirm'}
      </button>
    </form>
  )
}
