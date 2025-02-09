<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Editor from '~/components/playground/Editor.vue'

const initialTemplate = ref('')

onMounted(() => {
  initialTemplate.value = `import { Client } from '@taiyinet/ctaiyi'

const client = Client.testnet()`
})
</script>

<template>
  <div h-screen p="4 l-18" class="dark:bg-dark-900 dark:text-light-100">
    <Editor language="typescript" :value="initialTemplate" />
  </div>
</template>
