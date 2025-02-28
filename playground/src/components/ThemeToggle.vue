<script setup lang="ts">
import { isDark, toggleDark } from '~/composables/dark'
</script>

<template>
  <button
    flex="inline items-center justify-center" size-8 rounded-md p-1
    bg="hover:light-200 active:light-300 dark:hover:dark-200 dark:active:dark-300"
    @click="() => toggleDark()"
  >
    <div size-5 :class="isDark ? 'i-carbon:sun' : 'i-carbon:moon'" />
  </button>
</template>
