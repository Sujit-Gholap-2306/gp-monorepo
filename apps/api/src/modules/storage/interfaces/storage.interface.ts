export interface IStorageService {
  upload(localPath: string, bucket: string, destPath: string, contentType?: string): Promise<string | null>
  delete(bucket: string, filePath: string): Promise<boolean>
  getPublicUrl(bucket: string, filePath: string): string
}
