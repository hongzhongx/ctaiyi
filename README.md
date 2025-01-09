
# [ctaiyi](https://github.com/hongzhongx/ctaiyi) [![Build Status](https://img.shields.io/circleci/project/github/hongzhongx/ctaiyi.svg?style=flat-square)](https://circleci.com/gh/hongzhong/workflows/ctaiyi) [![Coverage Status](https://img.shields.io/coveralls/hongzhongx/ctaiyi.svg?style=flat-square)](https://coveralls.io/github/hongzhongx/ctaiyi?branch=master) [![Package Version](https://img.shields.io/npm/v/@taiyinet/ctaiyi.svg?style=flat-square)](https://www.npmjs.com/package/@taiyinet/ctaiyi)

Robust [taiyi blockchain](https://github.com/hongzhongx/taiyi) client library that runs in both node.js and the browser.

* [Demo](https://bot.taiyi.vc) ([source](https://github.com/hongzhongx/ctaiyi/tree/main/examples/watch-bot))
* [Documentation](https://hongzhongx.github.io/ctaiyi/)
* [Bug tracker](https://github.com/hongzhongx/ctaiyi/issues)

Installation
------------

### Via npm

For node.js or the browser with [browserify](https://github.com/substack/node-browserify) or [webpack](https://github.com/webpack/webpack).

```
npm install @taiyinet/ctaiyi
```

### From cdn or self-hosted script

Grab `dist/ctaiyi.js` from a [release](https://github.com/hongzhongx/ctaiyi/releases) and include in your html:

```html
<script src="ctaiyi.js"></script>
```

Or from the [unpkg](https://unpkg.com) cdn:

```html
<script src="https://unpkg.com/@taiyinet/ctaiyi@^1.0.0/dist/ctaiyi.js"></script>
```

Make sure to set the version you want when including from the cdn, you can also use `ctaiyi@latest` but that is not always desirable. See [unpkg.com](https://unpkg.com) for more information.


Usage
-----

### In the browser

```html
<script src="https://unpkg.com/@taiyinet/ctaiyi@latest/dist/ctaiyi.js"></script>
<script>
    var client = new ctaiyi.Client('https://api.taiyi.com')
    client.database.getDiscussions('trending', {tag: 'writing', limit: 1}).then(function(discussions){
        document.body.innerHTML += '<h1>' + discussions[0].title + '</h1>'
        document.body.innerHTML += '<h2>by ' + discussions[0].author + '</h2>'
        document.body.innerHTML += '<pre style="white-space: pre-wrap">' + discussions[0].body + '</pre>'
    })
</script>
```

See the [demo source](https://github.com/hongzhongx/ctaiyi/tree/master/examples/??) for an example on how to setup a livereloading TypeScript pipeline with [browserify](https://github.com/substack/node-browserify).

### In node.js

With TypeScript:

```typescript
import {Client} from '@taiyinet/ctaiyi'

const client = new Client('https://api.taiyi.com')

for await (const block of client.blockchain.getBlocks()) {
    console.log(`New block, id: ${ block.block_id }`)
}
```

With JavaScript:

```javascript
var ctaiyi = require('@taiyinet/ctaiyi')

var client = new ctaiyi.Client('https://api.taiyi.com')
var key = ctaiyi.PrivateKey.fromLogin('username', 'password', 'posting')

client.broadcast.vote({
    voter: 'username',
    author: 'almost-digital',
    permlink: 'ctaiyi-is-the-best',
    weight: 10000
}, key).then(function(result){
   console.log('Included in block: ' + result.block_num)
}, function(error) {
   console.error(error)
})
```

With ES2016 (node.js 7+):

```javascript
const {Client} = require('@taiyinet/ctaiyi')

const client = new Client('https://api.taiyi.com')

async function main() {
    const props = await client.database.getChainProperties()
    console.log(`Maximum blocksize consensus: ${ props.maximum_block_size } bytes`)
    client.disconnect()
}

main().catch(console.error)
```

With node.js streams:

```javascript
var ctaiyi = require('@taiyinet/ctaiyi')
var es = require('event-stream') // npm install event-stream
var util = require('util')

var client = new ctaiyi.Client('https://api.taiyi.com')

var stream = client.blockchain.getBlockStream()

stream.pipe(es.map(function(block, callback) {
    callback(null, util.inspect(block, {colors: true, depth: null}) + '\n')
})).pipe(process.stdout)
```


Bundling
--------

The easiest way to bundle ctaiyi (with browserify, webpack etc.) is to just `npm install @taiyinet/ctaiyi` and `require('@taiyinet/ctaiyi')` which will give you well-tested pre-bundled code guaranteed to JustWork™. However, that is not always desirable since it will not allow your bundler to de-duplicate any shared dependencies ctaiyi and your app might have.

To allow for deduplication you can `require('@taiyinet/ctaiyi/lib/index-browser')`, or if you plan to provide your own polyfills: `require('@taiyinet/ctaiyi/lib/index')`. See `src/index-browser.ts` for a list of polyfills expected.

---

*Share and Enjoy!*
