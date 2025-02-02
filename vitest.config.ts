import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    includeSource: ['app/**/*.{ts,tsx}'],
    setupFiles: ['./vitest-setup.ts'],
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
})
