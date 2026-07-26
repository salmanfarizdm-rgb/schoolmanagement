import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ParentNav from '@/components/parent/ParentNav'

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch child name for the nav
  const { data: parent } = await supabase
    .from('parents')
    .select('student_id, students(name)')
    .eq('id', user.id)
    .single()

  const childName = (parent?.students as unknown as { name: string } | null)?.name ?? 'My Child'

  return (
    <div className="min-h-screen flex flex-col">
      <ParentNav childName={childName} />
      <main className="flex-1 px-4 py-6 sm:px-6 max-w-2xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
