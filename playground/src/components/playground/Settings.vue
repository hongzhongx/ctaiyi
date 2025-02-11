<script lang="ts" setup>
import { useClientConfig } from '~/composables/useDevtools/client-state'
import Pane from './Pane.vue'

const config = useClientConfig()
</script>

<template>
  <Pane title="Settings" min-w-80>
    <form @submit.prevent="() => {}">
      <div>
        <label for="url">
          RPC 端点
        </label>
        <input id="url" v-model="config.url">
      </div>
    </form>
  </Pane>
</template>
