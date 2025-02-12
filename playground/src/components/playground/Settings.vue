<script lang="ts" setup>
import { Field } from '@ark-ui/vue/field'
import { createListCollection, Select } from '@ark-ui/vue/select'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed } from 'vue'
import { z } from 'zod'
import { useClientConfig } from '~/composables/useDevtools/client-state'
import Pane from './Pane.vue'

const configFormSchema = z.object({
  url: z.string().url('Invalid RPC endpoint URL'),
})

const config = useClientConfig()

const { handleSubmit, errors, defineField } = useForm({
  initialValues: {
    url: config.value.url,
  },
  validationSchema: toTypedSchema(configFormSchema),
})

const [url, urlAttrs] = defineField('url')

const collection = createListCollection({
  items: [
    { label: '1 mintue', value: 1 * 60 * 1000 },
    { label: '5 mintues', value: 5 * 60 * 1000 },
    { label: '10 mintues', value: 10 * 60 * 1000 },
    { label: 'never', value: 0 },
  ],
})

const computedAutoDisconnect = computed<string[]>({
  get() {
    return [config.value.autoDisconnect as unknown as string]
  },
  set(value) {
    config.value.autoDisconnect = value.at(0) ? Number.parseInt(value.at(0)!) : 0
  },
})

const onSubmit = handleSubmit(({ url }) => {
  const newConfig = {
    ...config.value,
    url,
  }

  config.value = newConfig
})

const isWS = computed(() => {
  return ['ws:', 'wss:'].includes(new URL(config.value.url).protocol)
})
</script>

<template>
  <Pane title="Settings" min-w-80>
    <form p-2 flex="~ col" @submit="onSubmit">
      <Field.Root relative flex="~ col gap-1" pb-5 :invalid="!!errors.url">
        <Field.Label text-sm c="data-[invalid]:c-red">
          RPC Endpoint
        </Field.Label>
        <Field.Input
          v-model="url"
          v-bind="urlAttrs" placeholder="RPC Endpoint" border="~ dark-200 rounded-md" p="x-2 y-1" h-8
          w-full bg-transparent text-sm outline-none
          class="transition-colors placeholder:text-dark-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
        />

        <Field.HelperText text-xs op-50>
          The RPC endpoint of the node you are using, both HTTP and WebSocket are supported.
        </Field.HelperText>
        <Field.ErrorText
          absolute bottom-0 left-0 text-xs c-red
        >
          {{ errors.url }}
        </Field.ErrorText>
      </Field.Root>
      <button
        h-10 rounded-md
        bg="light-300 dark:dark-300 hover:light-400 active:light-400 dark:hover:dark-400 dark:active:dark-400"
      >
        Confirm
      </button>
    </form>

    <section p-2 flex="~ col">
      <h3 text-base border="b light-300/5" pb-2>WebSocket Client Options</h3>
      <Field.Root v-if="isWS" relative flex="~ col gap-1" pb-5 >
        <Select.Root v-model="computedAutoDisconnect" :collection="collection">
          <Select.Label text-sm c="data-[invalid]:c-red">
            Auto Disconnect
          </Select.Label>
          <Select.Control>
            <Select.Trigger
              border="~ dark-200 rounded-md" flex="~ items-center justify-between" p="x-2 y-1" h-8 w-full
              bg-transparent text-sm outline-none
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
                bg="light-500 dark:dark-800" border="~ dark-200 rounded-md"
                class="max-h-96 min-w-[8rem] dark:text-light-100" relative z-50 of-hidden p-1 shadow-md
              >
                <Select.Item
                  v-for="item in collection.items" :key="item.label" :item="item" relative w-full
                  bg="data-[highlighted]:light-400 dark:data-[highlighted]:dark-400"
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
          Automatically socket disconnect after a period of time.
        </Field.HelperText>
      </Field.Root>
    </section>
  </Pane>
</template>
