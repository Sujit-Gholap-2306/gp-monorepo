import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import type { IStorageService } from './interfaces/storage.interface.js'

export class StorageService implements IStorageService {
  private readonly supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  )

  async upload(
    localPath: string,
    bucket: string,
    destPath: string,
    contentType?: string,
  ): Promise<string | null> {
    try {
      const file = fs.readFileSync(localPath)
      const { error } = await this.supabase.storage
        .from(bucket)
        .upload(destPath, file, { upsert: true, contentType: contentType ?? 'application/octet-stream' })

      if (error) throw error

      const { data } = this.supabase.storage.from(bucket).getPublicUrl(destPath)
      return data.publicUrl
    } catch (err) {
      console.error('Supabase upload error:', err)
      return null
    } finally {
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath)
    }
  }

  async delete(bucket: string, filePath: string): Promise<boolean> {
    const { error } = await this.supabase.storage.from(bucket).remove([filePath])
    return !error
  }

  getPublicUrl(bucket: string, filePath: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(filePath)
    return data.publicUrl
  }
}
