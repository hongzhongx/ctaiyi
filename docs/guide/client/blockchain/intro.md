# 区块链信息

主要封装了获取区块链的一些信息，如块高和区块内的操作等。

```ts twoslash
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})
```
