<script setup lang="ts">
import { createListCollection, Select } from '@ark-ui/vue/select'

const emit = defineEmits<(e: 'update', value: string) => void>()

const collection = createListCollection({
  items: [
    {
      label: '获取当前块高',
      value: `import { Client, http } from '@taiyinet/ctaiyi'

const client = Client.testnet({
  transport: http('http://127.0.0.1:8090'),
})

const {
  head_block_number,
} = await client.baiyujing.getDynamicGlobalProperties()

console.log('当前块高:', head_block_number)
`,
    },
    {
      label: '监听块高',
      value: `import { Client, http } from '@taiyinet/ctaiyi'

const client = Client.testnet({
  transport: http('http://127.0.0.1:8090'),
})

const stream = client.blockchain.getBlockNumberStream()
const reader = stream.getReader()

while (true) {
  const { done, value } = await reader.read()
  if (done)
    break
  console.log('当前块高:', value)
}`,
    },
  ],
})

function handleValueChange(value: Select.ValueChangeDetails<{ label: string, value: string }>) {
  if (value.value.at(0)) {
    emit('update', value.value.at(0)!)
  }
}
</script>

<template>
  <Select.Root :collection="collection" @value-change="handleValueChange">
    <Select.Control>
      <Select.Trigger
        flex="inline items-center gap-1"
        h-8 px-2
        bg="hover:light-900 active:light-800 dark:hover:dark-200 dark:active:dark-300"
      >
        <Select.ValueText placeholder="选择示例" />
        <Select.Indicator>
          <div i-carbon-chevron-down />
        </Select.Indicator>
      </Select.Trigger>
    </Select.Control>
    <Teleport to="body">
      <Select.Positioner z-9999>
        <Select.Content
          border="~ light-900 dark:dark-400"
          bg="white dark:dark-900" rounded-md py2 shadow-2xl
        >
          <Select.ItemGroup space-y-1>
            <Select.ItemGroupLabel px2 text-sm>
              示例代码
            </Select.ItemGroupLabel>
            <Select.Item
              v-for="item in collection.items"
              :key="item.label" role="button"
              :item="item"
              cursor-pointer
              flex="~ items-center gap-1"
              text-xs op-75 p="x-2 y-1"
              bg="hover:light-900 active:light-800 dark:hover:dark-200 dark:active:dark-300"
            >
              <Select.ItemText>{{ item.label }}</Select.ItemText>
              <Select.ItemIndicator>✓</Select.ItemIndicator>
            </Select.Item>
          </Select.ItemGroup>
        </Select.Content>
      </Select.Positioner>
    </Teleport>
    <Select.HiddenSelect />
  </Select.Root>
</template>
