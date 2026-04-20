import { createSupabaseServerClient } from './supabase/server'

const BUCKET = 'gp-media'

export async function uploadFile(
  gpId: string,
  folder: 'gallery' | 'events' | 'logo',
  file: File,
): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${gpId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const bytes = await file.arrayBuffer()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteFile(publicUrl: string): Promise<void> {
  const supabase = await createSupabaseServerClient()
  // Extract path from full public URL
  const marker = `/object/public/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return
  const path = publicUrl.slice(idx + marker.length)
  await supabase.storage.from(BUCKET).remove([path])
}
