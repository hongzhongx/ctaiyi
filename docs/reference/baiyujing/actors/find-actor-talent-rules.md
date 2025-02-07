# findActorTalentRules

查找角色的天赋规则。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const rules = await client.baiyujing.findActorTalentRules([0, 1])
//    ^?
```

## 返回值

`TalentRule[]`

返回角色天赋规则对象数组。每个对象包含规则 ID、规则类型、效果等信息。

## 参数

### actorIds

- 类型: `number[]`

角色 ID 数组
