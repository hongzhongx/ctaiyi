# getNfaActionInfo

获取 NFA 动作的详细信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const info = await client.baiyujing.getNfaActionInfo(22, 'short')
//    ^?
```

## 返回值

`NfaActionInfo`

返回 NFA 动作的详细信息对象，包含动作的参数、效果等信息。

## 参数

### nfaId

- 类型: `number`

NFA ID

### actionName

- 类型: `string`

动作名称
