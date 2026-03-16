import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'apps/portfolio-shell-astro/src/**/*.test.ts',
      'apps/portfolio-shell-astro/src/**/*.spec.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'apps/portfolio-shell-astro/src/**/*.ts'
      ],
      exclude: [
        'apps/**/node_modules/**',
        'apps/**/dist/**',
        'apps/**/*.test.ts',
        'apps/**/*.spec.ts',
        'apps/**/*.config.ts',
        'apps/**/*.d.ts'
      ]
    }
  }
})
