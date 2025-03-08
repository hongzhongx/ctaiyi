# findNfa

通过 NFA id 查找指定的 NFA。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const nfa = await client.baiyujing.findNfa(1)
```

## 返回值

[`Nfa`](/guide/types#nfa)

返回 NFA 对象。

## 参数

### nfaId

- 类型: `number`

NFA ID
