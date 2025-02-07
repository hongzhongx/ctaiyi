import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import Tsconfig from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    Tsconfig({
      projects: [
        fileURLToPath(new URL('../../tsconfig.json', import.meta.url)),
      ],
    }),
  ],
})
