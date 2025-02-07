# evalNfaAction

评估 NFA 动作的执行结果。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const result = await client.baiyujing.evalNfaAction(22, 'short', [])
//    ^?
```

## 返回值

`NfaActionEvalResult`

返回动作评估结果对象，包含执行效果、消耗等信息。

## 参数

### nfaId

- 类型: `number`

NFA ID

### actionName

- 类型: `string`

动作名称

### args

- 类型: `any[]`

动作参数数组
