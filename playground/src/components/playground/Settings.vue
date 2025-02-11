<script lang="ts" setup>
import { Popover } from '@ark-ui/vue/popover'
</script>

<template>
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
