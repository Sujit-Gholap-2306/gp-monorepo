import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    fileParallelism: false,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/**/*.ts',
        'src/services/**/*.ts',
        'src/controllers/**/*.ts',
      ],
      exclude: [
        'src/index.ts',
        'src/app.ts',
        'src/db/**',
        'src/config/**',
      ],
      thresholds: {
        lines:      60,
        functions:  60,
        branches:   50,
        statements: 60,
      },
    },
  },
})
