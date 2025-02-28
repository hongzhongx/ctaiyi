# ctaiyi

Robust javascript client library for [taiyi blockchain](https://github.com/hongzhongx/taiyi)

[![Package Version](https://img.shields.io/npm/v/@taiyinet/ctaiyi.svg?style=flat-square)](https://www.npmjs.com/package/@taiyinet/ctaiyi)

## Installation

```
npm install @taiyinet/ctaiyi
```

## Usage

```typescript
import { Client, http } from '@taiyinet/ctaiyi'

const client = new Client({
  transport: http('https://<node-url>')
})

for await (const block of client.blockchain.getBlocks()) {
  console.log(`New block, id: ${block.block_id}`)
}
```

## Development

### Requirement

- Node.js >= 22.13.1
- pnpm >= 10.0.0

### Install

```bash
# enable corepack
core enable
pnpm install
```

### Run all tests

```bash
pnpm test
```

### Build

```bash
pnpm build
```

## FAQ and Troubleshooting

ctaiyi supports all modern browsers (Chrome, Edge, Firefox, etc) & runtime environments (Node 22+, Deno, Bun, etc).

ctaiyi uses modern EcmaScript features such as:

- [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API)
- [`WebSocket`](https://developer.mozilla.org/docs/Web/API/WebSocket)
- [`TypedArray`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
- Error [`case`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
- [`Promise.withResolvers`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers)

---

*Share and Enjoy!*
