import type { DefaultTheme } from 'vitepress/theme'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createFileSystemTypesCache } from '@shikijs/vitepress-twoslash/cache-fs'
import { defineConfig } from 'vitepress'

const clientItems: DefaultTheme.SidebarItem = {
  text: 'RPC 客户端',
  base: '/client/',
  collapsed: false,
  items: [
    { text: '介绍', link: '/intro' },
  ],
}

const baiyujingItems: DefaultTheme.SidebarItem = {
  text: '白玉京 API',
  base: '/baiyujing/',
  collapsed: true,
  items: [
    {
      text: '介绍',
      link: '/intro',
    },
    {
      text: '账户',
      base: '/baiyujing/accounts',
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
      base: '/baiyujing/actors',
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
      base: '/baiyujing/nfa',
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
      base: '/baiyujing/transactions',
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
      base: '/baiyujing/simings',
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
      base: '/baiyujing/tiandao',
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

const guideSidebar: DefaultTheme.SidebarMulti['/guide/'] = {
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
      text: '指南',
      items: [

      ],
    },
    clientItems,
    baiyujingItems,
    {
      text: '广播交易',
      base: '/broadcast/',
      collapsed: true,
      items: [
        { text: '介绍', link: '/intro' },
      ],
    },
    {
      text: '区块链信息',
      base: '/blockchain/',
      collapsed: true,
      items: [
        { text: '介绍', link: '/intro' },
      ],
    },
    {
      text: '工具函数 & 类',
      base: '/utilities/',
      collapsed: true,
      items: [
        { text: 'PublicKey', link: '/public-key' },
      ],
    },
    {
      text: '类型',
      link: '/types',
      collapsed: true,
    },
  ],
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

    sidebar: [guideSidebar],

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
})
