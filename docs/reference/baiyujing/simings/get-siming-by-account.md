# getSimingByAccount

获取指定账户的司命信息。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| account | string | 账户名 |

## 返回值

返回司命对象。如果账户没有司命则返回 null。

## 示例

```ts
const siming = await client.baiyujing.getSimingByAccount('alice')
```
