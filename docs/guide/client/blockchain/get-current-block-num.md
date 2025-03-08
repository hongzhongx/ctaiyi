# getCurrentBlockNum

获取当前区块号。这是一个轻量级的方法，只返回当前区块的编号。

## 示例

```ts twoslash
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})

// ---cut---
const blockNumber = await client.blockchain.getCurrentBlockNum()
console.log(`当前区块号: ${blockNumber}`)
```
