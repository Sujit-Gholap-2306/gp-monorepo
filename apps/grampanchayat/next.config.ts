import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@repo/shadcn'],
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
}

export default nextConfig
