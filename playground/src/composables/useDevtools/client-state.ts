import type { ClientOptions } from '@taiyinet/ctaiyi'
import { useBroadcastChannel, useLocalStorage } from '@vueuse/core'

export const useClientState = () => useBroadcastChannel<boolean | undefined, boolean>({ name: 'ctaiyi-client:connecting' })

type Config = Partial<ClientOptions & { url: string }>

export function useClientConfig() {
  return useLocalStorage<Config>('ctaiyi-client:config', {
    url: 'ws://127.0.0.1:8090',
  })
}
