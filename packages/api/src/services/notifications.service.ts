import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function getUserNotifications(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, body, type, is_read, read_at, link, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function markNotificationRead(notifId: string, userId: string) {
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notifId)
    .eq('user_id', userId)
}

export async function markAllRead(userId: string) {
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false)
}

export async function createNotification(input: {
  userId:  string
  title:   string
  body:    string
  type:    'info' | 'warning' | 'success' | 'error'
  link?:   string
}) {
  await supabase.from('notifications').insert({
    user_id: input.userId,
    title:   input.title,
    body:    input.body,
    type:    input.type,
    link:    input.link ?? null,
  })
}
