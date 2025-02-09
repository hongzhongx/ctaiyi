<script setup lang="ts">
import { Splitter } from '@ark-ui/vue/splitter'
import { onMounted, ref } from 'vue'

import Editor from '~/components/playground/Editor.vue'
import Pane from '~/components/playground/Pane.vue'

const size = ref([
  { id: 'code', size: 50 },
  { id: 'console', size: 50 },
])

const initialTemplate = ref('')

onMounted(() => {
  initialTemplate.value = `import { Client } from '@taiyinet/ctaiyi'

const client = Client.testnet({ autoConnect: false ,url: "ws://47.109.49.30:8090"})

console.log(client)

await client.connect()
`
})
</script>

<template>
  <Splitter.Root
    :size="size"
  >
    <Splitter.Panel id="code">
      <Editor :value="initialTemplate" />
    </Splitter.Panel>
    <Splitter.ResizeTrigger id="code:console" relative w-4 class="focus-within:outline-none">
      <div absolute h-30px w-1px bg-gray-200 ml="-2px" class="left-1/2 top-1/2 translate-y--1/2" />
      <div absolute h-30px w-1px bg-gray-200 mr="1px" class="left-1/2 top-1/2 translate-y--1/2" />
    </Splitter.ResizeTrigger>
    <Splitter.Panel id="console">
      <Pane title="Console">
        <div p-2>
          Output
        </div>
      </Pane>
    </Splitter.Panel>
  </Splitter.Root>
</template>
