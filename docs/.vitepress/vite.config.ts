import { fileURLToPath } from 'node:url'
import {
  presetAttributify,
  presetIcons,
  presetUno,
} from 'unocss'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import Tsconfig from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    Tsconfig({
      projects: [
        fileURLToPath(new URL('../../tsconfig.json', import.meta.url)),
      ],
    }),
    UnoCSS({
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons(),
      ],
    }),
  ],
})
