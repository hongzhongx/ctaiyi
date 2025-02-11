<script setup lang="ts">
import { useHead } from '@unhead/vue'
import Header from '~/components/Header.vue'
import Playground from '~/components/playground/Playground.vue'

useHead({
  bodyAttrs: {
    class: 'dark:bg-dark-900 dark:text-light-100',
  },
})
</script>

<template>
  <main flex="~ col" mx-auto h-screen p-4 container>
    <Header />
    <div flex-1>
      <Playground />
    </div>
  </main>
</template>
