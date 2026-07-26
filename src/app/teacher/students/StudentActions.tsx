'use client'

import { useState, useTransition } from 'react'
import { updateParentContact, updateStudentStatus, resetParentPassword, updateStudentIdentity } from './actions'

interface Props {
  studentId: string
  studentName: string
  studentGender: string
  studentStatus: string
  parentId: string
  whatsapp: string
  secondary: string
}

export default function StudentActions({ studentId, studentName, studentGender, studentStatus, parentId, whatsapp, secondary }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'contact' | 'password' | 'status' | 'identity'>('contact')
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function handleContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await updateParentContact(fd)
      setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: 'Contact saved.' })
    })
  }

  function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await resetParentPassword(fd)
      setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: 'Password reset.' })
    })
  }

  function handleStatus(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await updateStudentStatus(fd)
      setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: 'Status updated.' })
    })
  }

  function handleIdentity(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await updateStudentIdentity(fd)
      setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: 'Identity updated.' })
    })
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setMsg(null) }}
        className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {(['contact', 'password', 'status', 'identity'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setMsg(null) }}
                  className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors
                    ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="p-4">
              {msg && (
                <p className={`mb-3 text-xs rounded-lg px-3 py-2 border ${msg.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {msg.text}
                </p>
              )}

              {tab === 'contact' && (
                <form onSubmit={handleContact} className="space-y-3">
                  <input type="hidden" name="parent_id" value={parentId} />
                  <div>
                    <label className="text-xs font-medium text-gray-700">WhatsApp number</label>
                    <input
                      name="whatsapp_number"
                      defaultValue={whatsapp}
                      placeholder="+60123456789"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Secondary contact</label>
                    <input
                      name="secondary_contact"
                      defaultValue={secondary}
                      placeholder="Optional"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button disabled={isPending} className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    Save
                  </button>
                </form>
              )}

              {tab === 'password' && (
                <form onSubmit={handlePassword} className="space-y-3">
                  <input type="hidden" name="parent_id" value={parentId} />
                  <div>
                    <label className="text-xs font-medium text-gray-700">New password</label>
                    <input
                      name="new_password"
                      type="password"
                      required
                      minLength={8}
                      placeholder="Min 8 characters"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button disabled={isPending} className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    Reset Password
                  </button>
                </form>
              )}

              {tab === 'status' && (
                <form onSubmit={handleStatus} className="space-y-3">
                  <input type="hidden" name="student_id" value={studentId} />
                  <div>
                    <label className="text-xs font-medium text-gray-700">Student status</label>
                    <select
                      name="status"
                      defaultValue={studentStatus}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <button disabled={isPending} className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    Update
                  </button>
                </form>
              )}

              {tab === 'identity' && (
                <form onSubmit={handleIdentity} className="space-y-3">
                  <input type="hidden" name="student_id" value={studentId} />
                  <div>
                    <label className="text-xs font-medium text-gray-700">Full name</label>
                    <input
                      name="name"
                      defaultValue={studentName}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Gender</label>
                    <select
                      name="gender"
                      defaultValue={studentGender}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Admission number</label>
                    <input
                      name="new_admission_no"
                      defaultValue={studentId}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-amber-600">Changing this will update the parent login username too.</p>
                  </div>
                  <button disabled={isPending} className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    Save Identity
                  </button>
                </form>
              )}
            </div>

            <div className="px-4 pb-4">
              <button onClick={() => setOpen(false)} className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
