# listToZonesByFrom

获取从指定区域可到达的目标区域列表。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| fromZoneId | number | 起始区域 ID |
| from | number | 起始索引（可选） |
| limit | number | 返回的最大数量（可选，默认: 100） |

## 返回值

返回可到达的目标区域对象数组。

## 示例

```ts
const toZones = await client.baiyujing.listToZonesByFrom(1, { limit: 10 })
```
