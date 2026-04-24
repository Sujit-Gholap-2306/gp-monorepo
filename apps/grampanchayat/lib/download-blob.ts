export type DownloadBlobOptions = {
  filename: string
  mimeType?: string
}

/**
 * Triggers a browser file-save for the given Blob.
 * Safari requires the anchor to be in the DOM before `.click()`.
 * Cleans up the object URL immediately after the click event is dispatched.
 */
export function downloadBlob(blob: Blob, options: DownloadBlobOptions): void {
  const { filename, mimeType } = options
  const file = mimeType && blob.type === '' ? new Blob([blob], { type: mimeType }) : blob
  const url  = URL.createObjectURL(file)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.rel      = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
