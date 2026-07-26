'use client'

import { useState, useTransition } from 'react'
import { updateThreshold, createTeacherAccount } from './actions'

export default function SettingsForm({ threshold }: { threshold: number }) {
  const [isPending, startTransition] = useTransition()
  const [thresholdMsg, setThresholdMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [teacherMsg, setTeacherMsg] = useState<{ ok: boolean; text: string } | null>(null)

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

  return (
    <div className="space-y-4">
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
