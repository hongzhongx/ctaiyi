import ctaiyiUrl from '@taiyinet/ctaiyi?url'
import { useEventListener } from '@vueuse/core'
import { onScopeDispose, ref, watchPostEffect } from 'vue'
import { isDark } from '../dark'
import devtoolsInjectUrl from './script/devtools?url'
import runnerScriptUrl from './script/runner?url'

import devtoolsTemplate from './templates/devtools.html?raw'
import runnerTemplate from './templates/runner.html?raw'

const DEFAULT_IMPORT_MAP = {
  '@noble/hashes': 'https://esm.sh/@noble/hashes@1.7.1',
  '@noble/hashes/': 'https://esm.sh/@noble/hashes@1.7.1/',
  '@noble/secp256k1': 'https://esm.sh/@noble/secp256k1@2.2.3',
  'tiny-invariant': 'https://esm.sh/tiny-invariant@1.3.3',
  'bs58': 'https://esm.sh/bs58@6.0.0',
  'bytebuffer': 'https://esm.sh/bytebuffer@5.0.1',
  'defu': 'https://esm.sh/defu@6.1.4',
  '@taiyinet/ctaiyi': new URL(ctaiyiUrl, import.meta.url).href,
}

const parser = new DOMParser()
const serializer = new XMLSerializer()

function generateHTML(importMap: Record<string, string> = DEFAULT_IMPORT_MAP) {
  const runnerDOM = parser.parseFromString(runnerTemplate, 'text/html')

  const importMapScript = runnerDOM.querySelector<HTMLScriptElement>('script[type="importmap"]')!
  importMapScript.textContent = JSON.stringify({ imports: importMap })

  const script = runnerDOM.querySelector<HTMLScriptElement>('script[src="__RUNNER_SCRIPT_URL__"]')!
  script.src = new URL(runnerScriptUrl, import.meta.url).href

  return serializer.serializeToString(runnerDOM)
}

function generateDevtoolsHTML() {
  const devtoolsDOM = parser.parseFromString(devtoolsTemplate, 'text/html')

  const script = devtoolsDOM.querySelector<HTMLScriptElement>('script[src="__DEVTOOLS_SCRIPT_URL__"]')!
  script.src = new URL(devtoolsInjectUrl, import.meta.url).href

  return serializer.serializeToString(devtoolsDOM)
}
export function useDevtoolsSrc() {
  const html = generateDevtoolsHTML()
  const devtoolsRawUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }))

  const runnerIframeSrcUrl = URL.createObjectURL(new Blob([generateHTML()], { type: 'text/html' }))

  onScopeDispose(() => {
    URL.revokeObjectURL(devtoolsRawUrl)
    URL.revokeObjectURL(runnerIframeSrcUrl)
  })

  const devtoolsLoaded = ref(false)

  const runnerIframe = ref<HTMLIFrameElement | null>(null)
  const devtoolsIframe = ref<HTMLIFrameElement | null>(null)
  const runnerLoaded = ref(false)

  useEventListener(window, 'message', (event) => {
    const fromRunner = event.source === runnerIframe.value?.contentWindow
    const fromDevtools = event.source === devtoolsIframe.value?.contentWindow
    if (fromRunner) {
      devtoolsIframe.value?.contentWindow?.postMessage(event.data, '*')
    }
    if (fromDevtools) {
      runnerIframe.value?.contentWindow?.postMessage({ event: 'DEV', data: event.data }, '*')
    }
  })

  useEventListener(runnerIframe, 'load', () => {
    runnerLoaded.value = true
  })

  useEventListener(devtoolsIframe, 'load', () => {
    devtoolsLoaded.value = true
  })

  watchPostEffect(() => {
    if (devtoolsLoaded.value && runnerLoaded.value)
      runnerIframe.value?.contentWindow?.postMessage({ event: 'LOADED' }, '*')
  })

  watchPostEffect(() => {
    localStorage.setItem('uiTheme', isDark.value ? '"dark"' : '"default"')
    devtoolsIframe.value?.contentWindow?.location.reload()
  })

  return {
    runnerIframeSrcUrl,
    devtoolsRawUrl: `${devtoolsRawUrl}#?embedded=${encodeURIComponent(location.origin)}`,
    refs: {
      runnerIframe,
      devtoolsIframe,
    },
  }
}
