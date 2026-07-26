'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { upsertAttendance } from './actions'
import { useState, useTransition } from 'react'
import { Pagination } from '@/components/ui/Pagination'

const STATUSES = ['Present', 'Absent', 'Leave', 'Late', 'Half-day'] as const
type Status = typeof STATUSES[number]

interface Student { id: string; name: string; gender: string }

interface Props {
  students: Student[]
  attMap: Record<string, { status: string; arrival_time: string | null; reason: string | null }>
  waMap: Record<string, string>
  date: string
  period: 'morning' | 'afternoon'
  page: number
  total: number
  pageSize: number
}

const statusColors: Record<string, string> = {
  Present:    'border-green-500 bg-green-50 text-green-700',
  Absent:     'border-red-500 bg-red-50 text-red-700',
  Leave:      'border-yellow-400 bg-yellow-50 text-yellow-700',
  Late:       'border-orange-400 bg-orange-50 text-orange-700',
  'Half-day': 'border-purple-400 bg-purple-50 text-purple-700',
}

/** Strip non-digits; convert leading 0 to 60 (Malaysian convention). */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return digits.startsWith('0') ? '60' + digits.slice(1) : digits
}

function buildWaLink(
  phone: string,
  studentName: string,
  status: 'Absent' | 'Leave',
  date: string,
  period: 'morning' | 'afternoon',
): string {
  const session = period === 'morning' ? 'morning session' : 'afternoon session'
  const msg = status === 'Absent'
    ? `Hi, ${studentName} was marked Absent on ${date} (${session}). Please let us know the reason for the absence. Thank you.`
    : `Hi, ${studentName} has been recorded on Leave on ${date} (${session}). Please let us know if any further information is needed. Thank you.`
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(msg)}`
}

function buildCorrectionLink(
  phone: string,
  studentName: string,
  newStatus: string,
  date: string,
  period: 'morning' | 'afternoon',
): string {
  const session = period === 'morning' ? 'morning session' : 'afternoon session'
  const msg = `Hi, please disregard our earlier absence message for ${studentName} on ${date} (${session}). The attendance record has been updated to ${newStatus}. Apologies for any inconvenience.`
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(msg)}`
}

function WaButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
    >
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-green-600" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      {label}
    </a>
  )
}

export default function AttendanceForm({
  students, attMap, waMap, date, period, page, total, pageSize,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selections, setSelections] = useState<Record<string, Status>>(() => {
    const init: Record<string, Status> = {}
    for (const s of students) {
      if (attMap[s.id]) init[s.id] = attMap[s.id].status as Status
    }
    return init
  })
  const [arrivals, setArrivals] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const s of students) {
      if (attMap[s.id]?.arrival_time) init[s.id] = attMap[s.id].arrival_time!
    }
    return init
  })
  // Track the last-saved status per student (starts from server data, updates after each save)
  const [savedStatuses, setSavedStatuses] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const s of students) {
      if (attMap[s.id]) init[s.id] = attMap[s.id].status
    }
    return init
  })
  // After a corrective save: student_id → new status (for correction WA button)
  const [corrections, setCorrections] = useState<Record<string, string>>({})

  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    p.set(key, value)
    p.delete('page')
    router.push(`${pathname}?${p.toString()}`)
  }

  function markAll(status: Status) {
    const next: Record<string, Status> = {}
    for (const s of students) next[s.id] = status
    setSelections(prev => ({ ...prev, ...next }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false)
    setError(null)
    setCorrections({})

    // Detect corrections before sending to server
    const newCorrections: Record<string, string> = {}
    for (const s of students) {
      const prev = savedStatuses[s.id]
      const next = selections[s.id]
      if (
        (prev === 'Absent' || prev === 'Leave') &&
        next && next !== 'Absent' && next !== 'Leave'
      ) {
        newCorrections[s.id] = next
      }
    }

    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await upsertAttendance(fd)
      if (result.error) {
        setError(result.error)
      } else {
        // Update local saved-status tracking
        setSavedStatuses(prev => {
          const next = { ...prev }
          for (const s of students) {
            if (selections[s.id]) next[s.id] = selections[s.id]
          }
          return next
        })
        setCorrections(newCorrections)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Date</label>
            <input
              type="date"
              name="date"
              defaultValue={date}
              onChange={e => setParam('date', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Period</label>
            <select
              name="period"
              value={period}
              onChange={e => setParam('period', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
            </select>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center">Mark all:</span>
          {STATUSES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => markAll(s)}
              className="rounded-full border px-3 py-1 text-xs font-medium hover:opacity-80 transition-opacity border-gray-300 text-gray-600"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Student list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {students.map((s, i) => {
          const sel = selections[s.id]
          const wa = waMap[s.id] ?? ''
          const normalizedWa = normalizePhone(wa)
          const showWaBtn = (sel === 'Absent' || sel === 'Leave') && !!normalizedWa
          const noWa = (sel === 'Absent' || sel === 'Leave') && !normalizedWa
          const correctionStatus = corrections[s.id]

          return (
            <div
              key={s.id}
              className={`p-4 ${i !== students.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.id} · {s.gender}</p>
                </div>
                {/* WA notify button — shown when selection is Absent/Leave */}
                {showWaBtn && (
                  <WaButton
                    href={buildWaLink(wa, s.name, sel as 'Absent' | 'Leave', date, period)}
                    label="Notify"
                  />
                )}
                {noWa && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2.5 py-1 text-xs text-gray-400">
                    No WA number
                  </span>
                )}
              </div>

              {/* Status chips */}
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map(status => (
                  <label key={status} className="cursor-pointer">
                    <input
                      type="radio"
                      name={`status_${s.id}_${period}`}
                      value={status}
                      checked={sel === status}
                      onChange={() => setSelections(prev => ({ ...prev, [s.id]: status }))}
                      className="sr-only"
                    />
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all
                        ${sel === status
                          ? statusColors[status] + ' ring-2 ring-offset-1 ring-current'
                          : 'border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}
                    >
                      {status}
                    </span>
                  </label>
                ))}
              </div>

              {/* Arrival time for Late */}
              {sel === 'Late' && (
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-gray-500">Arrival time:</label>
                  <input
                    type="time"
                    name={`arrival_${s.id}_${period}`}
                    value={arrivals[s.id] ?? ''}
                    onChange={e => setArrivals(prev => ({ ...prev, [s.id]: e.target.value }))}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Parent-submitted reason */}
              {attMap[s.id]?.reason && (
                <p className="mt-2 text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                  <span className="font-medium text-amber-700">Reason: </span>{attMap[s.id].reason}
                </p>
              )}

              {/* Correction WA button — shown after a corrective save */}
              {correctionStatus && normalizedWa && (
                <div className="mt-2 flex items-center gap-2">
                  <WaButton
                    href={buildCorrectionLink(wa, s.name, correctionStatus, date, period)}
                    label="Send correction"
                  />
                  <span className="text-xs text-gray-400">
                    Changed from Absent/Leave → {correctionStatus}
                  </span>
                </div>
              )}
            </div>
          )
        })}
        {students.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">No active students found.</p>
        )}
      </div>

      <Pagination page={page} pageSize={pageSize} total={total} />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">Attendance saved.</p>
      )}

      <button
        type="submit"
        disabled={isPending || students.length === 0}
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Saving…' : 'Save Attendance'}
      </button>
    </form>
  )
}
