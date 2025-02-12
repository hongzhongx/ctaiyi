import { useLocalStorage } from '@vueuse/core'

export function useClientState() {
  return useLocalStorage<'connected' | 'connecting' | 'disconnected'>(
    'ctaiyi-client:connecting',
    'disconnected',
  )
}

interface Config {
  url: string
  autoDisconnect: number
}

export function useClientConfig() {
  return useLocalStorage<Config>('ctaiyi-client:config', {
    url: 'ws://127.0.0.1:8090',
    autoDisconnect: 60 * 1000,
  })
}
