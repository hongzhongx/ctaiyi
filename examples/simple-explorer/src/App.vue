<script setup lang="ts">
import type { SignedBlock } from '@taiyinet/ctaiyi'
import { Client } from '@taiyinet/ctaiyi'
import JsonEditorVue from 'json-editor-vue'
import { ref } from 'vue'

const client = Client.testnet()
const blockNum = ref(0)

const loading = ref(false)

const blockDetails = ref<SignedBlock | null>(null)
async function queryBlock() {
  loading.value = true
  const block = await client.baiyujing.getBlock(blockNum.value)
  blockDetails.value = block
  loading.value = false
}

const currentBlockNumber = ref(0)

const stream = client.blockchain.getBlockNumberStream()
stream.getReader().read().then(({ done, value }) => {
  if (done) {
    
    // eslint-disable-next-line no-console
    console.log('stream done')
  }
  else {
    currentBlockNumber.value = value
  }
})
</script>

<template>
  <main
    text="center gray-700 dark:gray-200"
    mx-auto w-3xl border="~ gray-300 dark:gray-700 rounded-md"
    p="y4 x2" flex="~ col gap-4 items-center"
  >
    <h1>Simple Explorer</h1>
    <h2>Current Block Number: {{ currentBlockNumber }}</h2>
    <div flex="~ gap-2 items-center">
      <label for="blockNum">Block Number:</label>
      <input
        id="blockNum"
        v-model="blockNum" type="text"
        border="~ gray-300 dark:gray-700 rounded-md"
        p="x2 y1"
      >
      <button
        type="button" rounded-md p="x2 y1"
        @click="queryBlock"
      >
        Query
      </button>
    </div>
    <div>
      <h2>Block Details</h2>
      <JsonEditorVue v-model="blockDetails" />
    </div>
  </main>
</template>
