import type { editor as Editor } from 'monaco-editor'
import type { Ref } from 'vue'
import { createEventHook, tryOnUnmounted, until } from '@vueuse/core'

import darktheme from 'theme-vitesse/themes/vitesse-dark.json'
import lightTheme from 'theme-vitesse/themes/vitesse-light.json'
import { ref, unref, watch } from 'vue'
import { isDark } from '~/composables/dark'
import setupMonaco from '~/monaco'

export function useMonaco(target: Ref, options: any) {
  const changeEventHook = createEventHook<string>()
  const isSetup = ref(false)
  let editor: Editor.IStandaloneCodeEditor

  const setContent = async (content: string) => {
    await until(isSetup).toBeTruthy()
    if (editor)
      editor.setValue(content)
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

      const extension = () => {
        if (options.language === 'typescript')
          return 'ts'
        else if (options.language === 'javascript')
          return 'js'
        else if (options.language === 'html')
          return 'html'
      }

      const model = monaco.editor.createModel(options.code, options.language, monaco.Uri.parse(`file:///root/${Date.now()}.${extension()}`))
      editor = monaco.editor.create(el, {
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
  }
}
