import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import ParentReplyForm from './ParentReplyForm'

const PAGE_SIZE = 10

export default async function ParentRemarksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: parent } = await supabase
    .from('parents')
    .select('student_id')
    .eq('id', user!.id)
    .single()

  const page = parseInt(params.page ?? '1', 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: remarks, count } = await supabase
    .from('remarks')
    .select('*, remark_replies(*)', { count: 'exact' })
    .eq('student_id', parent?.student_id ?? '')
    .order('created_at', { ascending: false })
    .range(from, to)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Remarks</h1>

      {(remarks ?? []).map(remark => {
        const replies = Array.isArray(remark.remark_replies) ? remark.remark_replies : []
        return (
          <div key={remark.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-gray-500">{new Date(remark.created_at).toLocaleDateString()}</p>
              <Badge label={remark.severity} />
            </div>
            <p className="text-sm text-gray-700">{remark.description}</p>

            {replies.length > 0 && (
              <div className="space-y-2 border-t border-gray-100 pt-2">
                {replies.map((r: { id: number; author_role: string; message: string }) => (
                  <div key={r.id} className={`rounded-lg px-3 py-2 text-xs ${r.author_role === 'teacher' ? 'bg-blue-50 text-blue-800' : 'bg-gray-50 text-gray-700'}`}>
                    <span className="font-medium capitalize">{r.author_role}:</span> {r.message}
                  </div>
                ))}
              </div>
            )}

            <ParentReplyForm remarkId={remark.id} />
          </div>
        )
      })}

      {(remarks ?? []).length === 0 && (
        <p className="text-center text-sm text-gray-400 py-10">No remarks on file.</p>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  )
}
