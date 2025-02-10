<script setup lang="ts">
import { useEventBus } from '@vueuse/core'
import { ref, watch } from 'vue'
import Pane from '~/components/playground/Pane.vue'
import { useMonaco } from '~/composables/useMonaco'

const props = defineProps<{ value: string }>()
const emit = defineEmits<(e: 'change', content: string) => void>()
const target = ref<HTMLDivElement | null>(null)
const { onChange, setContent, execute } = useMonaco(target, {
  code: props.value,
})

type Events = { type: 'EXECUTE_CODE', data: string } | { type: 'COMPILE_CODE' }

const eventBus = useEventBus<Events>('code')

watch(() => props.value, () => setContent(props.value))

onChange(content => emit('change', content))

emit('change', props.value)

eventBus.on((e) => {
  if (e.type === 'COMPILE_CODE') {
    execute((code) => {
      eventBus.emit({ type: 'EXECUTE_CODE', data: code })
    })
  }
})
</script>

<template>
  <Pane title="Code">
    <div class="h-full w-full of-hidden">
      <div ref="target" class="h-full w-full" />
    </div>
  </Pane>
</template>
