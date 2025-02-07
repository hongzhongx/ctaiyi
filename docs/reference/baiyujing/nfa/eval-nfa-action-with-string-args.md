# evalNfaActionWithStringArgs

使用字符串参数评估 NFA 动作的执行结果。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| nfaId | number | NFA ID |
| actionName | string | 动作名称 |
| args | string | 字符串格式的动作参数 |

## 返回值

返回动作评估结果对象，包含执行效果、消耗等信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const result = await client.baiyujing.evalNfaActionWithStringArgs(1, 'read', '["1"]')
//    ^?
```
