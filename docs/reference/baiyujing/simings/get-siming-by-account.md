# getSimingByAccount

获取指定账户的司命节点信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const siming = await client.baiyujing.getSimingByAccount('alice')
//    ^?
```

## 返回值

`Siming | null`

返回司命节点对象。如果账户没有司命则返回 null。

## 参数

### account

- 类型: `string`

账户名
