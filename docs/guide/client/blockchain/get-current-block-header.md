# getCurrentBlockHeader

获取当前区块的区块头信息。相比 `getCurrentBlock`，这个方法只返回区块头信息，不包含完整的交易数据。

## 示例

```ts twoslash
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})

// ---cut---
const blockHeader = await client.blockchain.getCurrentBlockHeader()
console.log(blockHeader)
```
