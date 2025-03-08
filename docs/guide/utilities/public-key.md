# 公钥 (Public Key)

公钥是区块链中用于验证签名和标识账户的重要组成部分。在太乙中，公钥主要用于验证交易签名的有效性。所有公钥操作都封装在 `PublicKey` 类中。

## 创建公钥

有多种方式可以创建公钥：

### 从字符串创建

你可以使用 `PublicKey.fromString()` 或 `PublicKey.from()` 方法从编码的公钥字符串创建公钥：

```typescript twoslash
import { PublicKey } from '@taiyinet/ctaiyi'

// ---cut---
const encoded = 'TAI6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'
const key = PublicKey.fromString(encoded)
// 或者
const key2 = PublicKey.from(encoded)
```

### 从私钥派生

或者可以从一个私钥派生公钥：

```typescript twoslash
import { PrivateKey } from '@taiyinet/ctaiyi'

declare const privateKey: PrivateKey
// ---cut---
const publicKey = privateKey.createPublic()
// 可以指定地址前缀
const customPublicKey = privateKey.createPublic('TAI')
```

## 使用公钥

### 验证签名

公钥最重要的功能是验证签名：

```typescript twoslash
import { PublicKey, Signature } from '@taiyinet/ctaiyi'

declare const publicKey: PublicKey
declare const signature: Signature
// ---cut---
const message = new Uint8Array(32) // 32字节的消息
const isValid = publicKey.verify(message, signature)
```

### 导出公钥

可以将公钥导出为编码的字符串格式：

```typescript twoslash
import { PublicKey } from '@taiyinet/ctaiyi'

declare const publicKey: PublicKey
// ---cut---
const encoded = publicKey.toString()
```

### 获取公钥信息

你可以访问公钥的原始字节数据和地址前缀：

```typescript twoslash
import { PublicKey } from '@taiyinet/ctaiyi'

declare const publicKey: PublicKey
// ---cut---
const keyBytes = publicKey.key // Uint8Array
const prefix = publicKey.prefix // 例如: 'TAI'
```

## 注意事项

1. 公钥是可以公开的信息，但建议在需要时才分享。
2. 创建公钥时会自动验证其有效性，无效的公钥将抛出异常。
3. 默认的地址前缀是 'TAI'，但可以在创建时指定其他前缀。
4. 公钥字符串格式包含了校验和，可以检测输入错误。
