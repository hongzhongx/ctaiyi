import { useBroadcastChannel, useLocalStorage } from '@vueuse/core'

export const useClientState = () => useBroadcastChannel<boolean | undefined, boolean>({ name: 'ctaiyi-client:connecting' })

interface Config {
  url: string
  autoDisconnect: number | null
}

export function useClientConfig() {
  return useLocalStorage<Config>('ctaiyi-client:config', {
    url: 'ws://127.0.0.1:8090',
    autoDisconnect: 60 * 1000,
  })
}
