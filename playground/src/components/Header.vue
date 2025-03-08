<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
</script>

<template>
  <header p="x2 y-1" mb-1 flex="~ items-center justify-between">
    <div flex="~ items-baseline gap-2">
      <h1 text-2xl>
        Playground
      </h1>
      <h2 op-60>
        ctaiyi
      </h2>
    </div>
    <div flex="~ items-center gap-2">
      <ThemeToggle />
      <a
        role="button"
        flex="inline items-center justify-center" size-8 rounded-md p-1
        bg="hover:light-200 active:light-300 dark:hover:dark-200 dark:active:dark-300"
        href="https://github.com/hongzhongx/ctaiyi" target="_blank"
      >
        <div class="i-carbon:logo-github" size-5 />
      </a>
    </div>
  </header>
</template>
