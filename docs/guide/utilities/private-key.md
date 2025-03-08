# 私钥 (Private Key)

私钥是区块链中最重要的安全凭证之一。在太乙中，私钥用于签名交易和派生对应的公钥。所有私钥操作都封装在 `PrivateKey` 类中。

## 创建私钥

有多种方式可以创建私钥：

### 从 WIF 字符串创建

WIF (Wallet Import Format) 是一种广泛使用的私钥编码格式。你可以使用 `PrivateKey.fromString()` 或 `PrivateKey.from()` 方法从 WIF 字符串创建私钥：

```typescript twoslash
import { PrivateKey } from '@taiyinet/ctaiyi'

// ---cut---
const wif = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'
const key = PrivateKey.fromString(wif)
// 或者
const key2 = PrivateKey.from(wif)
```

### 从原始字节创建

如果你有私钥的原始字节数据（Uint8Array），可以直接创建私钥：

```typescript twoslash
import { PrivateKey } from '@taiyinet/ctaiyi'

// ---cut---
const bytes = new Uint8Array(32) // 示例字节数据
const key = new PrivateKey(bytes)
// 或者
const key2 = PrivateKey.from(bytes)
```

### 从种子创建

你可以使用任意字符串作为种子来创建私钥：

```typescript twoslash
import { PrivateKey } from '@taiyinet/ctaiyi'

// ---cut---
const seed = 'my-super-secret-seed'
const key = PrivateKey.fromSeed(seed)
```

### 从登录信息创建

可以使用用户名和密码创建私钥，这在钱包应用中特别有用：

```typescript twoslash
import { PrivateKey } from '@taiyinet/ctaiyi'

// ---cut---
const username = 'alice'
const password = 'secret123'
const key = PrivateKey.fromLogin(username, password) // 默认使用 'active' 角色
// 或者指定其他角色：'owner', 'posting', 'memo'
const postingKey = PrivateKey.fromLogin(username, password, 'posting')
```

## 使用私钥

### 签名消息

私钥最重要的功能是签名消息：

```typescript twoslash
import { PrivateKey } from '@taiyinet/ctaiyi'

declare const privateKey: PrivateKey
// ---cut---
const message = new Uint8Array(32) // 32字节的消息
const signature = privateKey.sign(message)
```

### 派生公钥

每个私钥都可以派生出对应的公钥即地址：

```typescript twoslash
import { PrivateKey } from '@taiyinet/ctaiyi'

declare const privateKey: PrivateKey
// ---cut---
const publicKey = privateKey.createPublic()
// 可以指定地址前缀和压缩选项
const customPublicKey = privateKey.createPublic('TAI', true)
```

### 导出私钥

可以将私钥导出为 WIF 格式的字符串：

```typescript twoslash
import { PrivateKey } from '@taiyinet/ctaiyi'

declare const privateKey: PrivateKey
// ---cut---
const wif = privateKey.toString()
```

## 注意事项

1. 私钥是极其敏感的信息，永远不要在不安全的环境中暴露或存储私钥。
2. 在控制台打印私钥对象时，为了安全考虑只会显示部分内容。如果需要完整的 WIF 字符串，请显式调用 `toString()` 方法。
3. 创建私钥时会自动验证其有效性，无效的私钥将抛出异常。
