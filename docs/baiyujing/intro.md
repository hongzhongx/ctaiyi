# 白玉京 API

通过访问白玉京 API 的接口，可以获取区块链上的数据。

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'

const client = new Client('https://<rpc-url>')
// ---cut---
const accounts = await client.baiyujing.getAccounts(['initminer'])
```
