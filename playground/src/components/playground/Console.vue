<script setup lang="ts">
import { Popover } from '@ark-ui/vue/popover'
import { useEventBus } from '@vueuse/core'
import { useDevtoolsSrc } from '~/composables/useDevtools'
import Pane from './Pane.vue'

const {
  devtoolsRawUrl,
  runnerIframeSrcUrl,
  refs: { runnerIframe, devtoolsIframe },
} = useDevtoolsSrc()

type Events = { type: 'EXECUTE_CODE', data: string } | { type: 'COMPILE_CODE' }

const eventBus = useEventBus<Events>('code')

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
  <Pane title="Console">
    <template #controls>
      <button
        type="button"
        flex="inline items-center gap-1"
        h-8 px-2
        border="l-1 dark:dark-300" bg="hover:dark-200 active:dark-300"
        @click="onClick"
      >
        <div class="i-carbon:play" size-3 />
        run
      </button>
      <Popover.Root
        :positioning="{
          placement: 'bottom-end',
          offset: { mainAxis: 1, crossAxis: 5 },
        }"
      >
        <Popover.Trigger as-child>
          <button
            type="button"
            flex="inline items-center gap-1"
            h-8 px-2
            border="l-1 dark:dark-300" bg="hover:dark-200 active:dark-300"
          >
            <div class="i-carbon:settings-adjust" size-3 />
          </button>
        </Popover.Trigger>
        <Teleport to="body">
          <Popover.Positioner>
            <Popover.Content
              bg="dark:dark-800 light-300"
              border="rounded-md" p="2" shadow="lg"
              c="dark: white"
            >
              <Popover.Arrow class="[--arrow-background:#f8f9fa] [--arrow-size:0.75rem] dark:[--arrow-background:#181818]">
                <Popover.ArrowTip />
              </Popover.Arrow>
              <Popover.Title text-sm>
                设置
              </Popover.Title>
              <Popover.Description text-xs>
                TODO
              </Popover.Description>
              <div>
                TODO
              </div>
            </Popover.Content>
          </Popover.Positioner>
        </Teleport>
      </Popover.Root>
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
