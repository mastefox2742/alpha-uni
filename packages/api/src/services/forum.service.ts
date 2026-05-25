import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ─── Forum ────────────────────────────────────────────────────────────────────

/**
 * Récupérer tous les posts d'un cours e-learning (threads + réponses)
 */
export async function getForumPosts(ecId: string) {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`
      id, content, is_pinned, created_at, updated_at, parent_id,
      profiles!user_id(first_name, last_name, avatar_url)
    `)
    .eq('elearning_course_id', ecId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

/**
 * Créer un post (ou une réponse si parentId fourni)
 */
export async function createForumPost(input: {
  ecId:     string
  userId:   string
  content:  string
  parentId?: string
}) {
  const insert: Record<string, unknown> = {
    elearning_course_id: input.ecId,
    user_id:             input.userId,
    content:             input.content,
  }
  if (input.parentId) insert.parent_id = input.parentId

  const { data, error } = await supabase
    .from('forum_posts')
    .insert(insert)
    .select(`
      id, content, is_pinned, created_at, parent_id,
      profiles!user_id(first_name, last_name, avatar_url)
    `)
    .single()

  if (error || !data) throw new Error('Impossible de créer le post')
  return data
}

/**
 * Épingler / désépingler un post (teachers + admins)
 */
export async function pinForumPost(postId: string, isPinned: boolean) {
  await supabase
    .from('forum_posts')
    .update({ is_pinned: isPinned })
    .eq('id', postId)
}

/**
 * Supprimer un post (auteur ou teacher)
 */
export async function deleteForumPost(postId: string) {
  await supabase.from('forum_posts').delete().eq('id', postId)
}
