import { fileURLToPath } from 'node:url'
import {
  presetAttributify,
  presetIcons,
  presetUno,
} from 'unocss'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import Tsconfig from 'vite-tsconfig-paths'
import { groupIconVitePlugin } from 'vitepress-plugin-group-icons'

export default defineConfig({
  plugins: [
    groupIconVitePlugin(),
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
