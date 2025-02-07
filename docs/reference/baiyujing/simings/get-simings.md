# getSimings

获取司命列表。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| simingIds | number[] | 司命 ID 数组 |

## 返回值

返回司命对象数组。每个对象包含司命的详细信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const simings = await client.baiyujing.getSimings([0])
//    ^?
```
