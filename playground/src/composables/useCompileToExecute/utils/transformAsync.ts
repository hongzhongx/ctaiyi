import { expose } from 'comlink'
import { fromObject } from 'convert-source-map'
import MagicString from 'magic-string'
import { isWebWorker } from './isWebWorker'

// eslint-disable-next-line ts/no-unused-expressions
`
;(async ()=>{

})()
`

export async function transformAsync(code: string) {
  const s = new MagicString(code)
  s.prepend(';(async ()=>{\n').append('\n})()')
  const map = s.generateMap({
    source: 'ctaiyi-example.ts',
    includeContent: true,
  })
  const inlineSourceMap = fromObject(map).toComment()
  return `${s.toString()}\n${inlineSourceMap}`
}

if (isWebWorker()) {
  expose(transformAsync)
}
