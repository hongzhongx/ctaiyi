# getCurrentBlock

获取当前区块的完整信息。

## 示例

```ts twoslash
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})

// ---cut---
const block = await client.blockchain.getCurrentBlock()
console.log(block)
```
