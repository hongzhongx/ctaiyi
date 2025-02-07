# 白玉京 API

调用节点提供的白玉京接口获取一些只读数据。

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'

const client = Client.testnet()
const baiyujing = client.baiyujing // [!code focus]
//    ^?
```
