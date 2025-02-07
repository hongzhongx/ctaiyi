# verifyAccountAuthority

验证账户的权限是否满足要求。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| account | string | 账户名 |
| keys | string[] | 公钥数组 |

## 返回值

返回布尔值，表示账户权限是否满足要求。

## 示例

```ts
const isValid = await client.baiyujing.verifyAccountAuthority('alice', ['PUBLIC_KEY_1'])
```
