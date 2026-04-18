import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@gp/shadcn'],
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
}

export default nextConfig
