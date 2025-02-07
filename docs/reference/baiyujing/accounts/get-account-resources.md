# getAccountResources

获取账户的资源使用情况。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| account | string | 账户名 |

## 返回值

返回账户资源使用情况对象，包含气力值、带宽等信息。

## 示例

```ts
const resources = await client.baiyujing.getAccountResources('alice')
```
