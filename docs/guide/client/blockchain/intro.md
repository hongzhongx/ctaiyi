# 区块链信息

本节包含了与区块链基本信息相关的 API，包括：

- 获取当前区块信息
- 获取区块流
- 获取区块号
- 获取操作记录

这些 API 可以帮助你实时监控区块链状态，获取历史数据等。

```ts twoslash
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})
```
