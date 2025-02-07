# getWithdrawRoutes

获取账户的提现路由设置。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| account | string | 账户名 |
| withdrawRouteType | 'incoming' \| 'outgoing' | 提现路由类型 |

## 返回值

返回提现路由设置数组。

## 示例

```ts
const routes = await client.baiyujing.getWithdrawRoutes('alice', 'outgoing')
```
