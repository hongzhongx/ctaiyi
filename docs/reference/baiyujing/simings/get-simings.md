# getSimings

获取司命列表。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| from | number | 起始索引（可选） |
| limit | number | 返回的最大数量（可选，默认: 100） |
| order | 'by_id' \| 'by_name' | 排序方式（可选，默认: 'by_id'） |

## 返回值

返回司命对象数组。每个对象包含司命的详细信息。

## 示例

```ts
const simings = await client.baiyujing.getSimings({ limit: 10 })
```
