'use client'

import { useState, useTransition } from 'react'
import { updateThreshold, createTeacherAccount, updateAcademicYear, regenerateSundays } from './actions'

interface Props {
  threshold: number
  academicYearStart: string
  academicYearEnd: string
}

export default function SettingsForm({ threshold, academicYearStart, academicYearEnd }: Props) {
  const [isPending, startTransition] = useTransition()
  const [thresholdMsg, setThresholdMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [teacherMsg, setTeacherMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [yearMsg, setYearMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [yearStart, setYearStart] = useState(academicYearStart)
  const [yearEnd, setYearEnd] = useState(academicYearEnd)

  // Academic year expiry warning: warn if end date is within 30 days
  const yearExpiring = (() => {
    if (!academicYearEnd) return false
    const end = new Date(academicYearEnd)
    const diff = (end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 30
  })()
  const yearExpired = (() => {
    if (!academicYearEnd) return false
    return new Date(academicYearEnd) < new Date()
  })()

  function handleThreshold(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setThresholdMsg(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await updateThreshold(fd)
      setThresholdMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: 'Threshold updated.' })
    })
  }

  function handleTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTeacherMsg(null)
    const fd = new FormData(e.currentTarget)
    const form = e.currentTarget
    startTransition(async () => {
      const r = await createTeacherAccount(fd)
      if (r.error) {
        setTeacherMsg({ ok: false, text: r.error })
      } else {
        setTeacherMsg({ ok: true, text: 'Teacher account created.' })
        form.reset()
      }
    })
  }

  function buildYearFd() {
    const fd = new FormData()
    fd.set('academic_year_start', yearStart)
    fd.set('academic_year_end', yearEnd)
    return fd
  }

  function handleYearSave(e: React.MouseEvent) {
    e.preventDefault()
    setYearMsg(null)
    startTransition(async () => {
      const r = await updateAcademicYear(buildYearFd())
      setYearMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: 'Academic year saved.' })
    })
  }

  function handleRegenerate(e: React.MouseEvent) {
    e.preventDefault()
    setYearMsg(null)
    startTransition(async () => {
      const r = await regenerateSundays(buildYearFd())
      setYearMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: 'Sundays regenerated in calendar.' })
    })
  }

  return (
    <div className="space-y-4">
      {/* Academic year expiry warning */}
      {(yearExpired || yearExpiring) && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${yearExpired ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
          {yearExpired
            ? `Academic year ended on ${academicYearEnd}. Update the year and regenerate Sundays to keep the calendar accurate.`
            : `Academic year ends on ${academicYearEnd} (within 30 days). Consider updating before it expires.`}
        </div>
      )}

      {/* Academic year */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Academic Year</h2>
        <p className="text-xs text-gray-500">
          Defines the school year date range. "Regenerate Sundays" will add all Sundays in this range to the calendar as holidays (existing entries are preserved).
        </p>

        {yearMsg && (
          <p className={`text-xs rounded-lg px-3 py-2 border ${yearMsg.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {yearMsg.text}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-medium text-gray-600">Start Date</label>
            <input
              type="date"
              value={yearStart}
              onChange={e => setYearStart(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-medium text-gray-600">End Date</label>
            <input
              type="date"
              value={yearEnd}
              onChange={e => setYearEnd(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleYearSave}
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save Dates'}
          </button>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isPending ? 'Working…' : 'Regenerate Sundays'}
          </button>
        </div>
      </div>

      {/* Attendance threshold */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Attendance Alert Threshold</h2>
        <p className="text-xs text-gray-500">
          Students below this percentage appear in the dashboard alert list.
        </p>

        {thresholdMsg && (
          <p className={`text-xs rounded-lg px-3 py-2 border ${thresholdMsg.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {thresholdMsg.text}
          </p>
        )}

        <form onSubmit={handleThreshold} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600">Threshold (%)</label>
            <input
              type="number"
              name="value"
              defaultValue={threshold}
              min={1}
              max={100}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Save
          </button>
        </form>
      </div>

      {/* Create teacher account */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Create Teacher Account</h2>
        <p className="text-xs text-gray-500">
          Use this to set up the teacher login. Only one teacher account is used.
        </p>

        {teacherMsg && (
          <p className={`text-xs rounded-lg px-3 py-2 border ${teacherMsg.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {teacherMsg.text}
          </p>
        )}

        <form onSubmit={handleTeacher} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="teacher@school.com"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="Min 8 characters"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Creating…' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
