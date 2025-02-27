# getBlockNumberStream

获取快高流，用于实时监听新区块号的产生。

## 示例

```ts twoslash
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})

// ---cut---
const stream = client.blockchain.getBlockNumberStream()
//    ^?
```

## 使用异步迭代器版本 (AsyncGenerator)

```ts twoslash
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})

// ---cut---
const asyncGenerator = client.blockchain.getBlockNumbers()
//    ^?
```
