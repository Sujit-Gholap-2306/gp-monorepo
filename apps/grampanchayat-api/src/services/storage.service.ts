import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import { env } from '../config/index.ts'

const supabase = createClient(
  env.SUPABASE_URL!,
  env.SUPABASE_SERVICE_KEY!,
)

export const storageService = {
  async upload(
    localPath: string,
    bucket: string,
    destPath: string,
    contentType?: string,
  ): Promise<string | null> {
    try {
      const file = fs.readFileSync(localPath)
      const { error } = await supabase.storage
        .from(bucket)
        .upload(destPath, file, { 
          upsert: true, 
          contentType: contentType ?? 'application/octet-stream' 
        })

      if (error) throw error

      const { data } = supabase.storage.from(bucket).getPublicUrl(destPath)
      return data.publicUrl
    } catch (err) {
      console.error('Supabase upload error:', err)
      return null
    } finally {
      // Clean up temp file
      try {
        fs.unlinkSync(localPath)
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  },

  async delete(bucket: string, filePath: string): Promise<boolean> {
    const { error } = await supabase.storage.from(bucket).remove([filePath])
    return !error
  },

  getPublicUrl(bucket: string, filePath: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return data.publicUrl
  }
}
