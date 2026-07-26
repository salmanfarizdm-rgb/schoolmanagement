'use client'

import { useRef, useState, useTransition } from 'react'
import { importStudentsCSV } from './actions'

export default function CSVImport() {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<{ created?: number; errors?: string[] } | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await importStudentsCSV(fd)
      setResult(r)
    })
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setResult(null) }}
        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
      >
        Import CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Import Students via CSV</h2>

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 space-y-1">
              <p className="font-medium">CSV format:</p>
              <p className="font-mono">admission_no,name,gender</p>
              <p className="font-mono text-gray-400">ADM001,Ali bin Ahmad,M</p>
              <p className="font-mono text-gray-400">ADM002,Siti binti Yusof,F</p>
              <p className="mt-1 text-gray-500">Header row optional. Gender: M / F / Other.</p>
            </div>

            {result && (
              <div className={`rounded-lg p-3 text-xs border ${result.errors?.length ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                <p className="font-medium">{result.created} student(s) imported.</p>
                {(result.errors ?? []).length > 0 && (
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    {result.errors!.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                    {result.errors!.length > 5 && <li>…and {result.errors!.length - 5} more errors.</li>}
                  </ul>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                ref={fileRef}
                type="file"
                name="csv"
                accept=".csv,text/csv"
                required
                className="w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-blue-700"
              />
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Importing…' : 'Import'}
              </button>
            </form>

            <button onClick={() => setOpen(false)} className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
