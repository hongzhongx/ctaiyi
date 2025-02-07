# findNfa

查找指定的 NFA。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| nfaId | number | NFA ID |

## 返回值

返回 NFA 对象。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const nfa = await client.baiyujing.findNfa(1)
//    ^?
```
