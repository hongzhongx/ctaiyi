import { useLocalStorage } from '@vueuse/core'

export interface RunnerClientConfig {
  url: string
  autoDisconnect: number
  state: 'connected' | 'connecting' | 'disconnected'
}

export function useClientConfig() {
  return useLocalStorage<RunnerClientConfig>(
    'ctaiyi-client:config',
    {
      url: 'ws://127.0.0.1:8090',
      autoDisconnect: 60 * 1000,
      state: 'disconnected',
    },
  )
}
