# listNfas

获取 NFA 列表。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| from | number | 起始索引（可选） |
| limit | number | 返回的最大数量（可选，默认: 100） |
| order | 'by_id' \| 'by_name' | 排序方式（可选，默认: 'by_id'） |

## 返回值

返回 NFA 对象数组。每个对象包含 NFA 的详细信息。

## 示例

```ts
const nfas = await client.baiyujing.listNfas({
  limit: 10,
  order: 'by_name'
})
```
