'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/(auth)/login/actions'
import { useState } from 'react'

const links = [
  { href: '/teacher/dashboard',       label: 'Dashboard',       icon: '📊' },
  { href: '/teacher/attendance',      label: 'Attendance',      icon: '✅' },
  { href: '/teacher/students',        label: 'Students',        icon: '👥' },
  { href: '/teacher/timetable',       label: 'Timetable',       icon: '📋' },
  { href: '/teacher/special-classes', label: 'Special Classes', icon: '📅' },
  { href: '/teacher/leaves',          label: 'Leave Requests',  icon: '📝' },
  { href: '/teacher/remarks',         label: 'Remarks',         icon: '💬' },
  { href: '/teacher/announcements',   label: 'Announcements',   icon: '📢' },
  { href: '/teacher/exams',           label: 'Exams',           icon: '📝' },
  { href: '/teacher/calendar',        label: 'Calendar',        icon: '🗓️' },
  { href: '/teacher/settings',        label: 'Settings',        icon: '⚙️' },
]

export default function TeacherNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
        <span className="font-bold text-blue-600 text-lg">ClassRoom</span>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </header>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-30 h-screen w-56
          flex flex-col bg-white border-r border-gray-200
          transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="p-4 border-b border-gray-100">
          <span className="font-bold text-blue-600 text-lg">ClassRoom</span>
          <p className="text-xs text-gray-400 mt-0.5">Teacher Portal</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {links.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <span>🚪</span> Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
