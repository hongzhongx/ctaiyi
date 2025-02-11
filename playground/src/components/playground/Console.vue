<script setup lang="ts">
import { useEventBus } from '@vueuse/core'
import { useDevtoolsSrc } from '~/composables/useDevtools'
import { useClientState } from '~/composables/useDevtools/client-state'
import Pane from './Pane.vue'

const {
  devtoolsRawUrl,
  runnerIframeSrcUrl,
  refs: { runnerIframe, devtoolsIframe },
} = useDevtoolsSrc()

type Events = { type: 'EXECUTE_CODE', data: string } | { type: 'COMPILE_CODE' }

const eventBus = useEventBus<Events>('code')
const {
  data: connectState,
} = useClientState()

eventBus.on((e) => {
  if (e.type === 'EXECUTE_CODE') {
    runnerIframe.value?.contentWindow?.postMessage({ event: 'CODE_UPDATE', value: e.data })
  }
})

function onClick() {
  eventBus.emit({ type: 'COMPILE_CODE' })
}
</script>

<template>
  <Pane>
    <template #title>
      <button
        type="button"
        flex="inline items-center gap-1"
        h-8 px-2
        bg="hover:dark-200 active:dark-300"
        @click="onClick"
      >
        <div class="i-carbon:play" size-3 />
        Run
      </button>
    </template>
    <template #controls>
      <div px-2 flex="inline items-center gap-2">
        <div
          size-2 rounded-full class="bg-dark-300"
          :class="{
            'animate-flash animate-iteration-infinite animate-duration-3000 bg-emerald': !!connectState,
          }"
        />
        {{ !!connectState ? 'Connected' : 'Disconnected' }}
      </div>
    </template>
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
  </Pane>
</template>
