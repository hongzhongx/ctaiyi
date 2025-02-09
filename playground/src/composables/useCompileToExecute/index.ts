import type { editor as Editor } from 'monaco-editor'
import type { MaybeRefOrGetter } from 'vue'
import type { transformAsync } from './utils/transformAsync'
import type { transformImports } from './utils/transformImports'
import { wrap } from 'comlink'
import { initialize, transform } from 'esbuild-wasm'

import wasmUrl from 'esbuild-wasm/esbuild.wasm?url'
import { serializeError } from 'serialize-error'
import { ref, toValue } from 'vue'
import TransformAsyncWorker from './utils/transformAsync?worker'

import TransformImportsWorker from './utils/transformImports?worker'

export function useCompileToExecute(editorRef: MaybeRefOrGetter<Editor.IStandaloneCodeEditor | null>) {
  const isInit = ref(false)

  async function assertInitialized() {
    if (!isInit.value) {
      try {
        await initialize({
          wasmURL: wasmUrl,
        })
      }
      catch (error) {
        if (
          serializeError(error as Error).message
          !== 'Cannot call "initialize" more than once'
        ) {
          throw error
        }
      }
      isInit.value = true
    }
  }
  async function compileCode(code: string) {
    await assertInitialized()

    if (code.includes('import')) {
      const worker = new TransformImportsWorker()
      const f = wrap<typeof transformImports>(worker)
      code = await f(code)
    }
    else {
      const worker = new TransformAsyncWorker()
      const f = wrap<typeof transformAsync>(worker)
      code = await f(code)
    }

    const result = await transform(code, {
      loader: 'ts',
      sourcemap: 'inline',
      format: 'iife',
      target: 'esnext',
    })
    return result.code
  }

  async function execute(runner: (code: string) => void) {
    try {
      const editor = toValue(editorRef)
      if (!editor)
        return
      // await editor.getAction('editor.action.formatDocument')?.run()
      const code = editor.getValue()
      const buildCode = await compileCode(code)
      runner(buildCode)
      // toast.success('Code executed successfully')
    }
    catch (error) {
      console.error('Error:', error)
      // toast.error('Compilation Error', {
      //   description: serializeError(error).message,
      //   duration: 10000, // 显示10秒
      //   style:
      //     'background: #FEF2F2; color: #991B1B; border: 1px solid #F87171;',
      // })
    }
  }

  return execute
}
