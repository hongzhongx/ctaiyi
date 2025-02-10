<script setup lang="ts">
import Header from '~/components/Header.vue'
import Playground from '~/components/playground/Playground.vue'
</script>

<template>
  <main
    h-screen p="4"
    flex="~ col "
    class="dark:bg-dark-900 dark:text-light-100"
  >
    <Header />
    <div flex-1>
      <Playground />
    </div>
  </main>
</template>
