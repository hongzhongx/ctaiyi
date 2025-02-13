# 快速开始 {#getting-started}

## 在线尝试 {#try-it-online}

可以直接在 [StackBlitz](https://vitepress.new) 上进行在线尝试。

## 安装 {#installation}

### 前置准备 {#prerequisites}

- [Node.js](https://nodejs.org/) 22 及以上版本。

::: code-group

```sh [npm]
$ npm add -D vitepress
```

```sh [pnpm]
$ pnpm add -D vitepress
```

```sh [yarn]
$ yarn add -D vitepress
```

```sh [bun]
$ bun add -D vitepress
```

:::

## 快速开始 {#quick-start}

### 1. 设置客户端 {#setup-client}

通过导出的 `Client` 类快速创建一个客户端实例以通过提供的接口与太乙区块链交互。

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'

const wsClient = new Client('wss://<node-url>') // [!code focus]
const httpClient = new Client('https://<node-url>') // [!code focus]
```

#### 2. 通过 `Client` 实例提供的接口获取区块链信息 {#get-blockchain-info}

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'

const client = new Client('https://<node-url>')
// ---cut---
const dynamicGlobalProperties = await client.baiyujing.getDynamicGlobalProperties()

console.log('当前块高:', dynamicGlobalProperties.head_block_number)
```
