# 客户端

客户端包装了一些接口可以提供对部分操作的访问，可以通过 `Client` 类创建。

```ts twoslash
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})
```

`Client` 构造函数的第一个参数是节点 rpc 的 url，可以接受 http 或者 ws 协议的 url，如果是使用 ws 协议，则需要在使用的时候关注 ws 连接状态。

```ts twoslash
import { Client, webSocket } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: webSocket('wss://<node-url>')
})
```
