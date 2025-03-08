# 平台兼容性

**ctaiyi** 支持所有现代浏览器（Chrome、Edge、Firefox 等）和运行环境（Node 22+、Deno、Bun 等）。

**ctaiyi** 使用现代 EcmaScript 特性，例如：

- [`TypedArray`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
- [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API)
- Error [`case`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
- [`WebSocket`](https://developer.mozilla.org/docs/Web/API/WebSocket)
- [`Promise.withResolvers`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers)

## Polyfills

如果您的平台不支持上述特性，您也可以导入一个 polyfill。

### `fetch`

- [isomorphic-unfetch](https://github.com/developit/unfetch/tree/main/packages/isomorphic-unfetch)
- [node-fetch](https://github.com/node-fetch/node-fetch#providing-global-access)

### `WebSocket`

- [ws](https://github.com/websockets/ws)

### `TypedArray`, `Error.cause`, `Promise.withResolvers`

- [core-js](https://github.com/zloirock/core-js)
