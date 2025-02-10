<script setup lang="ts">
import { useEventBus } from '@vueuse/core'
import { useDevtoolsSrc } from '~/composables/useDevtools'

const {
  devtoolsRawUrl,
  runnerIframeSrcUrl,
  refs: { runnerIframe, devtoolsIframe },
} = useDevtoolsSrc()

const eventBus = useEventBus<string>('code-change')

eventBus.on((code) => {
  runnerIframe.value?.contentWindow?.postMessage({ event: 'CODE_UPDATE', value: code })
})
</script>

<template>
  <iframe
    ref="devtoolsIframe"
    title="Devtools"
    absolute inset-0 block h-full w-full
    :src="devtoolsRawUrl"
    frameborder="0"
  />
  <iframe
    ref="runnerIframe"
    :src="runnerIframeSrcUrl"
    frameborder="0"
    hidden
    sandbox="allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals allow-same-origin"
  />
</template>
