<script setup lang="ts">
defineProps<{
  title: string
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
      p="l-2"
      h="8" class="rounded-t-md"
    >
      <div flex="1">
        {{ title }}
      </div>
      <div flex="~ row" items="center">
        <slot name="controls" />
      </div>
    </div>
    <div bg="dark:dark-800 light-300" position="relative" border="rounded-b-md" w="full" class="overflow-auto">
      <slot />
    </div>
  </div>
</template>
