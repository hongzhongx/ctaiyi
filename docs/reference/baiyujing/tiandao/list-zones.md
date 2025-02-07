# listZones

获取区域列表。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| from | number | 起始索引（可选） |
| limit | number | 返回的最大数量（可选，默认: 100） |
| order | 'by_id' \| 'by_name' | 排序方式（可选，默认: 'by_id'） |

## 返回值

返回区域对象数组。每个对象包含区域的详细信息。

## 示例

```ts
const zones = await client.baiyujing.listZones({
  limit: 10,
  order: 'by_name'
})
```
