import type { editor as Editor } from 'monaco-editor'
import type { Ref } from 'vue'

import { createEventHook, tryOnUnmounted, until } from '@vueuse/core'
import darktheme from 'theme-vitesse/themes/vitesse-dark.json'
import lightTheme from 'theme-vitesse/themes/vitesse-light.json'
import { ref, shallowRef, unref, watch } from 'vue'
import { isDark } from '~/composables/dark'
import { useCompileToExecute } from '~/composables/useCompileToExecute'
import setupMonaco from '~/monaco'

export interface MonacoOptions {
  code: string
}

export function useMonaco(target: Ref<HTMLDivElement | null>, options: MonacoOptions) {
  const changeEventHook = createEventHook<string>()
  const isSetup = ref(false)
  const editor = shallowRef<Editor.IStandaloneCodeEditor | null>(null)
  const execute = useCompileToExecute(editor)

  const setContent = async (content: string) => {
    await until(isSetup).toBeTruthy()
    if (editor.value)
      editor.value.setValue(content)
  }

  const init = async () => {
    const { monaco } = await setupMonaco()
    // @ts-expect-error: missing property
    monaco.editor.defineTheme('vitesse-dark', darktheme)
    // @ts-expect-error: missing property
    monaco.editor.defineTheme('vitesse-light', lightTheme)

    watch(target, () => {
      const el = unref(target)

      if (!el)
        return

      const model = monaco.editor.createModel(
        options.code,
        'typescript',
        monaco.Uri.parse(`file:///root/${Date.now()}.ts`),
      )

      editor.value = monaco.editor.create(el, {
        model,
        tabSize: 2,
        insertSpaces: true,
        autoClosingQuotes: 'always',
        detectIndentation: false,
        folding: false,
        automaticLayout: true,
        theme: 'vitesse-dark',
        minimap: {
          enabled: false,
        },
        fixedOverflowWidgets: true,
        overflowWidgetsDomNode: document.querySelector<HTMLElement>('#app')!,
      })

      model.onDidChangeContent(() => {
        const value = model.getValue()
        changeEventHook.trigger(value)
      })

      isSetup.value = true

      watch(isDark, () => {
        if (isDark.value)
          monaco.editor.setTheme('vitesse-dark')
        else
          monaco.editor.setTheme('vitesse-light')
      }, { immediate: true })
    }, {
      flush: 'post',
      immediate: true,
    })
  }

  init()

  tryOnUnmounted(() => stop())

  return {
    onChange: changeEventHook.on,
    setContent,
    execute,
  }
}
