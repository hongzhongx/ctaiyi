# getOperationsStream

获取操作记录流，用于实时监听新的操作记录。

## 示例

```ts twoslash
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})

// ---cut---
const stream = client.blockchain.getOperationsStream({ from: 1, to: 2 })
//    ^?
```

## 使用异步迭代器版本 (AsyncGenerator)

```ts twoslash
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})

// ---cut---
const asyncGenerator = client.blockchain.getOperations()
//    ^?
```
