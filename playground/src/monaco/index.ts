import { createSingletonPromise } from '@vueuse/core'

import * as monaco from 'monaco-editor'
import { getCurrentInstance, onMounted } from 'vue'
// eslint-disable-next-line antfu/no-import-dist
import ctaiyiTypes from '../../../dist/index.d.ts?raw'

const setup = createSingletonPromise(async () => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    strict: true,
    esModuleInterop: true,
    moduleDetection: 3, // force
  })

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `declare module "@taiyinet/ctaiyi" {${ctaiyiTypes}}`,
    'file:///node_modules/@taiyinet/ctaiyi/dist/index.d.ts',
  )

  const loadWorkers = async () => {
    const { default: EditorWorker } = await import('monaco-editor/esm/vs/editor/editor.worker?worker')
    const { default: TsWorker } = await import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')
    window.MonacoEnvironment = {
      getWorker(_: any, label) {
        if (label === 'typescript' || label === 'javascript') {
          return new TsWorker()
        }
        return new EditorWorker()
      },
    }
  }
  await loadWorkers()

  if (getCurrentInstance())
    await new Promise<void>(resolve => onMounted(resolve))

  return { monaco }
})

export default setup

setup()
