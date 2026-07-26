import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TeacherNav from '@/components/teacher/TeacherNav'
import NotificationBell from '@/components/teacher/NotificationBell'
import { Suspense } from 'react'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <TeacherNav />
      <main className="flex-1 lg:ml-56 min-w-0">
        {/* Desktop top bar with notification bell */}
        <div className="hidden lg:flex items-center justify-end px-8 py-3 border-b border-gray-100 bg-white sticky top-0 z-20">
          <Suspense fallback={<div className="w-9 h-9" />}>
            <NotificationBell />
          </Suspense>
        </div>
        {/* Mobile bell — rendered inside TeacherNav's header via slot */}
        <div className="lg:hidden fixed top-2.5 right-14 z-40">
          <Suspense fallback={null}>
            <NotificationBell />
          </Suspense>
        </div>
        <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
