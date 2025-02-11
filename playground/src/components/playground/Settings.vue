<script lang="ts" setup>
import { Field } from '@ark-ui/vue/field'
import { createListCollection, Select } from '@ark-ui/vue/select'
import { computed, watch } from 'vue'
import { useClientConfig } from '~/composables/useDevtools/client-state'
import Pane from './Pane.vue'

const config = useClientConfig()

const collection = createListCollection({
  items: [
    { label: '1 mintue', value: 1 * 60 * 1000 },
    { label: '5 mintues', value: 5 * 60 * 1000 },
    { label: '10 mintues', value: 10 * 60 * 1000 },
    { label: 'never', value: 0 },
  ],
})

const autoDisconnect = computed<string[]>({
  get() {
    return [config.value.autoDisconnect as unknown as string]
  },
  set(value) {
    config.value.autoDisconnect = value.at(0) ? Number.parseInt(value.at(0)!) : 0
  },
})

</script>

<template>
  <Pane title="Settings" min-w-80>
    <form p-2 flex="~ col gap-2">
      <Field.Root flex="~ col gap-1">
        <Field.Label text-sm>
          RPC Endpoint
        </Field.Label>
        <Field.Input
          v-model="config.url"
          placeholder="RPC Endpoint"
          border="~ dark-200 rounded-md"
          p="x-2 y-1" h-8 w-full bg-transparent text-sm outline-none
          class="transition-colors placeholder:text-dark-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
        />
        <Field.HelperText text-xs op-50>
          The RPC endpoint of the node you are using
        </Field.HelperText>
      </Field.Root>
      <Field.Root>
        <Select.Root v-model="autoDisconnect" :collection="collection">
          <Select.Label text-sm>
            Auto Disconnect
          </Select.Label>
          <Select.Control>
            <Select.Trigger
              border="~ dark-200 rounded-md"
              flex="~ items-center justify-between"
              p="x-2 y-1" h-8 w-full bg-transparent text-sm outline-none
              class="whitespace-nowrap text-sm shadow-sm [&>span]:line-clamp-1 placeholder:text-dark-100 focus:outline-none focus:ring-1 focus:ring-white"
            >
              <Select.ValueText placeholder="Auto Disconnect after" />
              <Select.Indicator>
                <div class="i-carbon:chevron-down" />
              </Select.Indicator>
            </Select.Trigger>
          </Select.Control>
          <Teleport to="body">
            <Select.Positioner class="w-$reference-width">
              <Select.Content
                bg="light-500 dark:dark-800"
                border="~ dark-200 rounded-md"

                class="max-h-96 min-w-[8rem] dark:text-light-100" relative z-50 of-hidden p-1 shadow-md
              >
                <Select.Item
                  v-for="item in collection.items"
                  :key="item.label" :item="item"
                  relative w-full bg="data-[highlighted]:light-400 dark:data-[highlighted]:dark-400"
                  flex="~ items-center justify-between" text-sm p="x2 y-1.5"
                  class="cursor-default select-none rounded-sm outline-none"
                >
                  <Select.ItemText>{{ item.label }}</Select.ItemText>
                  <Select.ItemIndicator>✓</Select.ItemIndicator>
                </Select.Item>
              </Select.Content>
            </Select.Positioner>
          </Teleport>
        </Select.Root>
        <Field.HelperText text-xs op-50>
          Automatically disconnect after a period of time
        </Field.HelperText>
      </Field.Root>
    </form>
  </Pane>
</template>
