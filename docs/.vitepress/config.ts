import type { DefaultTheme } from 'vitepress/theme'
import { fileURLToPath } from 'node:url'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createFileSystemTypesCache } from '@shikijs/vitepress-twoslash/cache-fs'
import { defineConfig } from 'vitepress'

function baiyujingItems(): DefaultTheme.SidebarItem {
  return {
    text: '白玉京 API',
    base: '/guide/client/baiyujing/',
    collapsed: true,
    items: [
      {
        text: '介绍',
        link: '/intro',
      },
      {
        text: '账户',
        collapsed: false,
        items: [
          {
            text: 'getAccounts',
            link: '/get-accounts',
          },
          {
            text: 'lookupAccountNames',
            link: '/lookup-account-names',
          },
          {
            text: 'lookupAccounts',
            link: '/lookup-accounts',
          },
          {
            text: 'getAccountsCount',
            link: '/get-accounts-count',
          },
          {
            text: 'getAccountHistory',
            link: '/get-account-history',
          },
          {
            text: 'getAccountResources',
            link: '/get-account-resources',
          },
          {
            text: 'getOwnerHistory',
            link: '/get-owner-history',
          },
          {
            text: 'getRecoveryRequest',
            link: '/get-recovery-request',
          },
          {
            text: 'getWithdrawRoutes',
            link: '/get-withdraw-routes',
          },
          {
            text: 'getQiDelegations',
            link: '/get-qi-delegations',
          },
          {
            text: 'getExpiringQiDelegations',
            link: '/get-expiring-qi-delegations',
          },
        ],
      },
      {
        text: '角色',
        collapsed: false,
        items: [
          {
            text: 'findActor',
            link: '/find-actor',
          },
          {
            text: 'findActors',
            link: '/find-actors',
          },
          {
            text: 'listActors',
            link: '/list-actors',
          },
          {
            text: 'getActorHistory',
            link: '/get-actor-history',
          },
          {
            text: 'listActorsBelowHealth',
            link: '/list-actors-below-health',
          },
          {
            text: 'findActorTalentRules',
            link: '/find-actor-talent-rules',
          },
          {
            text: 'listActorsOnZone',
            link: '/list-actors-on-zone',
          },
        ],
      },
      {
        text: 'NFA',
        collapsed: false,
        items: [
          {
            text: 'findNfa',
            link: '/find-nfa',
          },
          {
            text: 'findNfas',
            link: '/find-nfas',
          },
          {
            text: 'listNfas',
            link: '/list-nfas',
          },
          {
            text: 'getNfaHistory',
            link: '/get-nfa-history',
          },
          {
            text: 'getNfaActionInfo',
            link: '/get-nfa-action-info',
          },
          {
            text: 'evalNfaAction',
            link: '/eval-nfa-action',
          },
          {
            text: 'evalNfaActionWithStringArgs',
            link: '/eval-nfa-action-with-string-args',
          },
        ],
      },
      {
        text: '交易',
        collapsed: true,
        items: [
          {
            text: 'getTransactionHex',
            link: '/get-transaction-hex',
          },
          {
            text: 'getTransaction',
            link: '/get-transaction',
          },
          {
            text: 'getTransactionResults',
            link: '/get-transaction-results',
          },
          {
            text: 'getRequiredSignatures',
            link: '/get-required-signatures',
          },
          {
            text: 'getPotentialSignatures',
            link: '/get-potential-signatures',
          },
          {
            text: 'verifyAuthority',
            link: '/verify-authority',
          },
          {
            text: 'verifyAccountAuthority',
            link: '/verify-account-authority',
          },
        ],
      },

      {
        text: '司命',
        collapsed: true,
        items: [
          {
            text: 'getSimings',
            link: '/get-simings',
          },
          {
            text: 'getSimingByAccount',
            link: '/get-siming-by-account',
          },
          {
            text: 'getSimingsByAdore',
            link: '/get-simings-by-adore',
          },
          {
            text: 'lookupSimingAccounts',
            link: '/lookup-siming-accounts',
          },
          {
            text: 'getSimingCount',
            link: '/get-siming-count',
          },
        ],
      },
      {
        text: '天道',
        collapsed: true,
        items: [
          {
            text: 'getTiandaoProperties',
            link: '/get-tiandao-properties',
          },
          {
            text: 'findZones',
            link: '/find-zones',
          },
          {
            text: 'findZonesByName',
            link: '/find-zones-by-name',
          },
          {
            text: 'listZones',
            link: '/list-zones',
          },
          {
            text: 'listZonesByType',
            link: '/list-zones-by-type',
          },
          {
            text: 'listToZonesByFrom',
            link: '/list-to-zones-by-from',
          },
          {
            text: 'listFromZonesByTo',
            link: '/list-from-zones-by-to',
          },
          {
            text: 'findWayToZone',
            link: '/find-way-to-zone',
          },
          {
            text: 'getContractSourceCode',
            link: '/get-contract-source-code',
          },
        ],
      },
    ],
  }
}

function broadcastItems(): DefaultTheme.SidebarItem {
  return {
    text: '广播交易',
    base: '/broadcast/',
    collapsed: true,
    items: [
      { text: '介绍', link: '/intro' },
    ],
  }
}

function blockchainItems(): DefaultTheme.SidebarItem {
  return {
    text: '区块链信息',
    base: '/guide/client/blockchain/',
    collapsed: true,
    items: [
      { text: '介绍', link: '/intro' },

      { text: 'getCurrentBlock', link: '/get-current-block' },
      { text: 'getCurrentBlockHeader', link: '/get-current-block-header' },
      { text: 'getCurrentBlockNum', link: '/get-current-block-num' },

      { text: 'getBlockStream', link: '/get-block-stream' },

      { text: 'getBlockNumberStream', link: '/get-block-number-stream' },

      { text: 'getOperationsStream', link: '/get-operations-stream' },
    ],
  }
}

function guideSidebar(): DefaultTheme.SidebarMulti['/guide/'] {
  return {
    base: '/guide/',
    items: [
      {
        text: '简介',
        collapsed: false,
        items: [
          { text: '快速开始', link: '/getting-started' },
          { text: '平台兼容性', link: '/compatibility' },
          { text: '常见问题', link: '/faq' },
        ],
      },
      {
        text: 'RPC 客户端',
        base: '/guide/client/',
        collapsed: false,
        items: [
          { text: '介绍', link: '/intro' },
          baiyujingItems(),
          blockchainItems(),
          broadcastItems(),
        ],
      },
      {
        text: '工具函数 & 类',
        base: '/guide/utilities/',
        collapsed: true,
        items: [
          { text: 'PublicKey', link: '/public-key' },
          { text: 'PrivateKey', link: '/private-key' },
        ],
      },
      {
        text: '类型',
        link: '/guide/types',
        collapsed: true,
      },
    ],
  }
}

export default defineConfig({
  title: 'ctaiyi',
  description: 'taiyi 区块链的 JavaScript SDK',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started', activeMatch: '/guide/' },
    ],

    editLink: {
      pattern: 'https://github.com/hongzhongx/ctaiyi/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },

    sidebar: {
      '/guide/': guideSidebar(),
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
    codeCopyButtonTitle: '复制代码',
  },
  cleanUrls: true,
  vite: {
    configFile: fileURLToPath(new URL('./vite.config.ts', import.meta.url)),
  },
})
