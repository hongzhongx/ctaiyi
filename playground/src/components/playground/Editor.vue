<script setup lang="ts">
import { ref, watch } from 'vue'
import Pane from '~/components/playground/Pane.vue'
import { useMonaco } from '~/composables/useMonaco'

const props = defineProps<{ value: string }>()
const emit = defineEmits<(e: 'change', content: string) => void>()
const target = ref<HTMLDivElement | null>(null)
const { onChange, setContent, execute } = useMonaco(target, {
  code: props.value,
})

watch(() => props.value, () => setContent(props.value))
onChange(content => emit('change', content))
emit('change', props.value)

defineExpose({
  execute,
})
</script>

<template>
  <Pane title="Code">
    <template #controls>
      <button
        type="button"
        px-2 h-8
        border="l-1 dark:dark-300"
        bg="hover:dark-200 active:dark-300"
        @click="execute"
      >
        Execute
      </button>
    </template>
    <div class="h-full w-full of-hidden">
      <div ref="target" class="h-full w-full" />
    </div>
  </Pane>
</template>
