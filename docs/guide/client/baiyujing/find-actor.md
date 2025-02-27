# findActor

查找指定的角色信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const actor = await client.baiyujing.findActor('李火旺')
```

## 返回值

[`Actor`](/reference/types#actor)

返回角色对象。

## 参数

### name

- 类型: `string`

角色名称
