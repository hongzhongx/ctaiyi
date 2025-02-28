# 客户端

客户端包装了一些接口可以提供对部分操作的访问，可以通过 `Client` 类创建。

`Client` 构造函数的参数必须要一个传输层，可以接受 http 或者 ws 协议，通过导出的 `http` 和 `webSocket` 函数创建传输层并在客户端内使用。

```ts twoslash
import { Client, http, webSocket } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})

const wsClient = new Client({
  transport: webSocket('wss://<node-url>')
})
```

## 其他参数

### chainId

**特定的链 id 字符串**

主网（未上线）为 `0000000000000000000000000000000000000000000000000000000000000000`

现存的测试网为 `18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e`

### addressPrefix

**地址前缀**

一般为 `TAI` 如果你想要连接的节点有不一样的设置，可以提供这个参数
