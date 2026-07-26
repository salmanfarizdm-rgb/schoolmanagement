'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/(auth)/login/actions'

const links = [
  { href: '/parent/dashboard',       label: 'Home',       icon: '🏠' },
  { href: '/parent/attendance',      label: 'Attendance', icon: '✅' },
  { href: '/parent/leave',           label: 'Leave',      icon: '📝' },
  { href: '/parent/timetable',       label: 'Timetable',  icon: '📋' },
  { href: '/parent/special-classes', label: 'Classes',    icon: '📅' },
  { href: '/parent/remarks',         label: 'Remarks',    icon: '💬' },
  { href: '/parent/announcements',   label: 'News',       icon: '📢' },
  { href: '/parent/exams',           label: 'Exams',      icon: '📝' },
]

export default function ParentNav({ childName }: { childName: string }) {
  const pathname = usePathname()

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <div>
            <span className="font-bold text-blue-600">ClassRoom</span>
            <span className="text-xs text-gray-500 ml-2">{childName}</span>
          </div>
          <form action={logout}>
            <button type="submit" className="text-xs text-gray-500 hover:text-red-600 transition-colors">
              Sign out
            </button>
          </form>
        </div>

        {/* Tab nav */}
        <nav className="max-w-2xl mx-auto flex border-t border-gray-100">
          {links.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors
                  ${active
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>
      </header>
    </>
  )
}
