import { createClient } from '@/lib/supabase/server'
import NotificationBellClient, { type NotificationItem } from './NotificationBellClient'

export default async function NotificationBell() {
  const supabase = await createClient()

  const [{ data: pendingLeaves }, { data: recentReplies }] = await Promise.all([
    supabase
      .from('leave_requests')
      .select('id, student_id, reason, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('remark_replies')
      .select('id, remark_id, message, created_at')
      .eq('author_role', 'parent')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })

  const leaveItems = (pendingLeaves ?? []).map(lr => ({
    key: `leave-${lr.id}`,
    label: `Leave request · student ${lr.student_id}`,
    sub: `${lr.reason} · ${fmt(lr.created_at)}`,
    href: '/teacher/leaves' as const,
    at: lr.created_at,
  }))

  const replyItems = (recentReplies ?? []).map(rr => ({
    key: `reply-${rr.id}`,
    label: `Parent replied to remark #${rr.remark_id}`,
    sub: `"${rr.message.slice(0, 55)}${rr.message.length > 55 ? '…' : ''}" · ${fmt(rr.created_at)}`,
    href: '/teacher/remarks' as const,
    at: rr.created_at,
  }))

  const items: NotificationItem[] = [...leaveItems, ...replyItems]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 15)
    .map(({ at: _at, ...rest }) => rest)

  const count = (pendingLeaves?.length ?? 0) + (recentReplies?.length ?? 0)

  return <NotificationBellClient count={count} items={items} />
}
