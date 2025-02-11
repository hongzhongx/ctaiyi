<script setup lang="ts">
import { Splitter } from '@ark-ui/vue/splitter'
import { onMounted, ref } from 'vue'

import Editor from '~/components/playground/Editor.vue'
import Console from './Console.vue'

const size = ref([
  { id: 'code', size: 50 },
  { id: 'console', size: 50 },
])

const initialTemplate = ref('')

onMounted(() => {
  initialTemplate.value = `/**
 * playground 已经初始化好运行环境
 * 只需要访问 client 就可以使用客户端的接口来通过设置的 rpc 来与 taiyi 交互
 */
const accounts = await client.baiyujing.getAccounts(['initminer'])

console.log(accounts)`
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
      <Console />
    </Splitter.Panel>
  </Splitter.Root>
</template>
