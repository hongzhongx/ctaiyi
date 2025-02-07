# listZonesByType

按类型获取区域列表。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| type | string | 区域类型 |
| from | number | 起始索引（可选） |
| limit | number | 返回的最大数量（可选，默认: 100） |

## 返回值

返回指定类型的区域对象数组。

## 示例

```ts
const zones = await client.baiyujing.listZonesByType('city', { limit: 10 })
```
