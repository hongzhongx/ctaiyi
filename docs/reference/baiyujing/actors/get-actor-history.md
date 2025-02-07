# getActorHistory

获取角色的历史记录。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| actorId | number | 角色 ID |
| from | number | 起始序号（可选） |
| limit | number | 返回的最大数量（可选，默认: 100） |

## 返回值

返回角色历史记录数组。每条记录包含操作类型、时间戳、变更详情等信息。

## 示例

```ts
const history = await client.baiyujing.getActorHistory(1, { limit: 10 })
```
