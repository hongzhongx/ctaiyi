<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div h="full" grid="~ rows-[min-content_auto]" border="1 light-900 dark:dark-400" shadow="lg" class="rounded-md" of-hidden>
    <div
      flex="~ row"
      text="xs"
      items="center"
      bg="light-500 dark:dark-800"
      border="b-1 dark:dark-400 light-900"
      :p="!$slots.title && 'l-2'"
      h="8" class="rounded-t-md"
    >
      <div flex="1">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100" 
        leave-to-class="opacity-0"
      >
        <div v-if="$slots.controls" flex="~ row" items="center" class="divide-x-1 dark:divide-dark-300">
          <slot name="controls" />
        </div>
      </Transition>
    </div>
    <div bg="dark:dark-800 light-300" position="relative" border="rounded-b-md" w="full" class="overflow-auto">
      <slot />
    </div>
  </div>
</template>
