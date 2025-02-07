# listFromZonesByTo

获取可到达指定目标区域的起始区域列表。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| toZoneId | number | 目标区域 ID |
| from | number | 起始索引（可选） |
| limit | number | 返回的最大数量（可选，默认: 100） |

## 返回值

返回可到达目标区域的起始区域对象数组。

## 示例

```ts
const fromZones = await client.baiyujing.listFromZonesByTo(1, { limit: 10 })
```
