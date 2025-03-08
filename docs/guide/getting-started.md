# 开始使用

## 在线尝试

你可以在[在线演练场](https://ctaiyi-playground.vercel.app/)中在线尝试 ctaiyi 。它直接在浏览器中运行 ctaiyi 而不需要在你的计算机上安装任何东西。

## 将 ctaiyi 安装到项目

::: code-group

```sh [npm]
$ npm add -D @taiyinet/ctaiyi
```

```sh [pnpm]
$ pnpm add -D @taiyinet/ctaiyi
```

```sh [yarn]
$ yarn add -D @taiyinet/ctaiyi
```

```sh [bun]
$ bun add -D @taiyinet/ctaiyi
```

:::

:::tip
ctaiyi 需要 Node 版本高于 v22.0.0，查看[平台兼容性](/guide/compatibility)
:::

## 快速开始

### 1. 设置客户端

通过导出的 `Client` 类快速创建一个客户端实例以通过提供的接口与太乙区块链交互。

```ts twoslash
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({ // [!code focus]
  transport: http('https://<node-url>') // [!code focus]
}) // [!code focus]
```

#### 2. 通过 `Client` 实例提供的接口获取区块链信息

```ts twoslash
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})
// ---cut---
const dynamicGlobalProperties = await client.baiyujing.getDynamicGlobalProperties()

console.log('当前块高:', dynamicGlobalProperties.head_block_number)
```
