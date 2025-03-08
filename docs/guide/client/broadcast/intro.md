# 广播操作

广播操作是与太乙区块链交互的主要方式。每个操作都代表了一个具体的链上行为，比如转账、创建账户、更新账户信息等。

## 基本用法

所有的广播操作都需要一个私钥来签名。以转账操作为例：

```typescript twoslash
import { Client, PrivateKey } from '@taiyinet/ctaiyi'

declare const client: Client
// ---cut---
const privateKey = PrivateKey.fromString('your-private-key')

await client.broadcast.transfer({
  from: 'sender',
  to: 'receiver',
  amount: '1.000 YANG',
  memo: '转账说明'
}, privateKey)
```

## 操作列表

太乙链支持以下广播操作：

> [!TIP]
> 下面的所有文档内容仍在编写中

### 账户操作
- [创建账户](./create-account.md)
- [更新账户](./update-account.md)
- [恢复账户](./recover-account.md)
- [请求账户恢复](./request-account-recovery.md)
- [更改恢复账户](./change-recovery-account.md)

### 资产操作
- [转账](./transfer.md)
- [QI转账](./transfer-to-qi.md)
- [提现QI](./withdraw-qi.md)
- [设置QI提现路由](./set-withdraw-qi-route.md)
- [委托QI](./delegate-qi.md)

### 司命操作
- [更新司命](./siming-update.md)
- [设置司命属性](./siming-set-properties.md)
- [司命崇拜](./account-siming-adore.md)
- [司命代理](./account-siming-proxy.md)
- [放弃崇拜权](./decline-adoring-rights.md)

### 合约操作
- [创建合约](./create-contract.md)
- [修改合约](./revise-contract.md)
- [调用合约函数](./call-contract-function.md)

### NFA操作
- [创建NFA符号](./create-nfa-symbol.md)
- [创建NFA](./create-nfa.md)
- [转移NFA](./transfer-nfa.md)
- [批准NFA激活](./approve-nfa-active.md)
- [NFA动作](./action-nfa.md)
- [NFA资源转换](./nfa-convert-resources.md)
- [NFA转移](./nfa-transfer.md)
- [NFA存取](./nfa-deposit-withdraw.md)

### 角色操作
- [创建角色天赋规则](./create-actor-talent-rule.md)
- [创建角色](./create-actor.md)
- [角色出生](./actor-born.md)
- [角色天赋触发](./actor-talent-trigger.md)
- [角色移动](./actor-movement.md)
- [角色成长](./actor-grown.md)

### 天道操作
- [天道年变](./tiandao-year-change.md)
- [天道月变](./tiandao-month-change.md)
- [天道时变](./tiandao-time-change.md)

### 其他操作
- [创建区域](./create-zone.md)
- [自定义数据](./custom.md)
- [自定义JSON](./custom-json.md)
- [记录叙事](./narrate-log.md)

## 交易过期时间

默认情况下，交易将在60秒后过期。你可以通过设置 `client.broadcast.expireTime` 来修改这个值：

```typescript twoslash
declare const client: import('@taiyinet/ctaiyi').Client
// ---cut---
client.broadcast.expireTime = 120 * 1000 // 设置为120秒
```

## 错误处理

当广播操作失败时，会抛出异常。

建议使用 try-catch 来处理可能的错误：

```typescript twoslash
// @noErrors
declare const client: import('@taiyinet/ctaiyi').Client
// ---cut---
try {
  await client.broadcast.transfer(/*   */)
}
catch (error) {
  console.error('广播失败:', error)
}
```
