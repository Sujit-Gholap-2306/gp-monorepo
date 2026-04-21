import type { Metadata } from 'next'
import './preview.css'

export const metadata: Metadata = {
  title: 'ग्रामपंचायत — Premium Portal Preview',
  description: 'Civic Elegant showcase for Maharashtra Gram Panchayat portals.',
}

/**
 * The actual theme-aware wrapper is applied inside page.tsx (which reads
 * `?theme=` from searchParams). This layout just imports the CSS fallbacks
 * and renders children.
 */
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
