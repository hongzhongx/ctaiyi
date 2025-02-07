import type { DefaultTheme } from 'vitepress/theme'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createFileSystemTypesCache } from '@shikijs/vitepress-twoslash/cache-fs'
import { defineConfig } from 'vitepress'

const guideSidebar: DefaultTheme.SidebarMulti['/guide/'] = {
  base: '/guide/',
  items: [
    {
      text: '简介',
      collapsed: false,
      items: [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
          ],
        },
      ],
    },
    {
      text: 'API 参考',
      base: '/reference/',
      link: '/client/intro',
    },
  ],
}

const referenceSidebar: DefaultTheme.SidebarMulti['/reference/'] = {
  base: '/reference/',
  items: [
    {
      text: 'Client',
      base: '/reference/client/',
      collapsed: false,
      items: [
        { text: '介绍', link: '/intro' },
      ],
    },
    {
      text: '白玉京 API',
      base: '/reference/baiyujing/',
      collapsed: false,
      items: [
        { text: '介绍', link: '/intro' },
      ],
    },
    {
      text: '广播 API',
      base: '/reference/broadcast/',
      collapsed: false,
      items: [
        { text: '介绍', link: '/intro' },
      ],
    },
    {
      text: '区块链工具',
      base: '/reference/blockchain/',
      collapsed: true,
      items: [
        { text: '介绍', link: '/intro' },
      ],
    },
  ],
}

export default defineConfig({
  title: 'ctaiyi',
  description: 'taiyi 区块链的 JavaScript SDK',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'API 参考', link: '/reference/client/intro', activeMatch: '/reference/' },
    ],

    editLink: {
      pattern: 'https://github.com/hongzhongx/ctaiyi/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },

    sidebar: {
      '/guide/': guideSidebar,
      '/reference/': referenceSidebar,
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hongzhongx/ctaiyi' },
    ],
  },
  markdown: {
    codeTransformers: [
      transformerTwoslash({
        typesCache: createFileSystemTypesCache(),
      }),
    ],
  },
})
