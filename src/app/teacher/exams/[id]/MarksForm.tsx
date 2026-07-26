'use client'

import { useState, useTransition } from 'react'
import { saveMarks } from '../actions'

interface Exam {
  id: number
  subject: string
  max_marks: number
}

interface Student {
  id: string
  name: string
}

interface Props {
  exam: Exam
  students: Student[]
  marksMap: Record<string, { marks: number | null; remarks: string | null }>
}

export default function MarksForm({ exam, students, marksMap }: Props) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await saveMarks(fd)
      setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: 'Marks saved.' })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="exam_id" value={exam.id} />

      {msg && (
        <p className={`text-xs rounded-lg px-3 py-2 border ${msg.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {msg.text}
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_120px_160px] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <span className="text-xs font-semibold text-gray-500">Student</span>
          <span className="text-xs font-semibold text-gray-500">Marks / {exam.max_marks}</span>
          <span className="text-xs font-semibold text-gray-500">Remarks</span>
        </div>

        {students.map((s, i) => {
          const existing = marksMap[s.id]
          return (
            <div
              key={s.id}
              className={`grid grid-cols-[1fr_120px_160px] gap-3 items-center px-4 py-2 ${i !== students.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <span className="text-sm text-gray-800 truncate">{s.name}</span>
              <input
                type="number"
                name={`marks_${s.id}`}
                defaultValue={existing?.marks ?? ''}
                min={0}
                max={exam.max_marks}
                step={0.5}
                placeholder="—"
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
              <input
                type="text"
                name={`remarks_${s.id}`}
                defaultValue={existing?.remarks ?? ''}
                placeholder="Optional"
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
          )
        })}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save All Marks'}
      </button>
    </form>
  )
}
