import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TeacherNav from '@/components/teacher/TeacherNav'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <TeacherNav />
      <main className="flex-1 lg:ml-56 min-w-0">
        <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
