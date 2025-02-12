/* eslint-disable no-console */
import type Chobitsu from 'chobitsu'
import type { RunnerClientConfig } from '../client-state'
import { Client, WebSocketTransport } from '@taiyinet/ctaiyi'
import { debouncedWatch, useEventListener, useTimeoutFn } from '@vueuse/core'
import { useClientConfig } from '../client-state'

declare global {
  interface Window {
    dispose?: () => void
    client?: import('@taiyinet/ctaiyi').Client
  }

  const chobitsu: typeof Chobitsu
}

const config = useClientConfig()

const {
  start,
  stop,
} = useTimeoutFn(
  () => {
    if (import.meta.env.DEV) {
      console.log('[ctaiyi-repl] auto disconnect client')
    }

    if (!window.client) {
      console.warn('[ctaiyi-repl] ctaiyi client not initialized yet')
      return
    }

    window.client?.disconnect()
  },
  () => config.value.autoDisconnect ?? Number.POSITIVE_INFINITY,
  { immediate: false },
)

async function onConfigChange(
  newConfig: RunnerClientConfig,
  oldConfig: RunnerClientConfig | undefined,
) {
  if (newConfig.url !== oldConfig?.url) {
    attachClientInstance(newConfig.url)
  }

  if (!window.client) {
    console.warn('[ctaiyi-repl] ctaiyi client not initialized yet')
    return
  }
  if (window.client?.transport instanceof WebSocketTransport) {
    if (newConfig.state === 'disconnected' && window.client.isConnected()) {
      window.client?.disconnect()
    }
    else if (newConfig.state === 'connecting' && !window.client.isConnected()) {
      window.client?.connect()
    }
    if (newConfig.autoDisconnect === 0) {
      stop()
    }
    else {
      start()
    }
  }
}

debouncedWatch(config, (newConfig, oldConfig) => {
  if (import.meta.env.DEV) {
    console.log('[ctaiyi-repl] update runner config', { newConfig, oldConfig })
  }
  onConfigChange(newConfig, oldConfig)
}, { debounce: 1000, deep: true, immediate: true })

function sendToDevtools(message: Record<string, any>) {
  window.parent.postMessage(JSON.stringify(message), '*')
}

function sendToChobitsu(message: Record<string, any> & { id?: string }) {
  message.id = `CTAIYI_REPL:${Date.now()}`
  chobitsu.sendRawMessage(JSON.stringify(message))
}

window.addEventListener('message', ({ data }) => {
  const { event, value } = data

  if (event !== 'CODE_UPDATE')
    return

  window.dispose?.()
  window.dispose = undefined

  console.clear()

  if (!window.client) {
    console.warn('[ctaiyi-repl] ctaiyi client not initialized yet')
  }

  document.getElementById('runner')?.remove()
  const script = document.createElement('script')
  script.id = 'runner'
  script.type = 'module'
  script.textContent = value
  document.body.appendChild(script)
})

chobitsu.setOnMessage((message) => {
  if (message.includes('CTAIYI_REPL'))
    return
  window.parent.postMessage(message, '*')
})

window.addEventListener('message', ({ data }) => {
  try {
    const { event } = data
    if (event === 'DEV') {
      chobitsu.sendRawMessage(data.data)
    }
    else if (['CONNECT', 'DISCONNECT'].includes(event)) {
      if (!window.client) {
        console.warn('[ctaiyi-repl] ctaiyi client not initialized yet')
      }
      if (event === 'CONNECT')
        window.client?.connect()
      else
        window.client?.disconnect()
    }
    else if (event === 'LOADED') {
      sendToDevtools({
        method: 'Page.frameNavigated',
        params: {
          frame: {
            id: '1',
            mimeType: 'text/html',
            securityOrigin: location.origin,
            url: location.href,
          },
          type: 'Navigation',
        },
      })
      sendToChobitsu({ method: 'Network.enable' })
      sendToDevtools({ method: 'Runtime.executionContextsCleared' })
      sendToChobitsu({ method: 'Runtime.enable' })
      sendToChobitsu({ method: 'Debugger.enable' })
      sendToChobitsu({ method: 'DOMStorage.enable' })
      sendToChobitsu({ method: 'DOM.enable' })
      sendToChobitsu({ method: 'CSS.enable' })
      sendToChobitsu({ method: 'Overlay.enable' })
      sendToDevtools({ method: 'DOM.documentUpdated' })
    }
  }
  catch (e) {
    console.error(e)
  }
})

function attachClientInstance(url: string) {
  if (import.meta.env.DEV) {
    console.log('[ctaiyi-repl] attach client instance', url)
  }
  if (window.client && window.client.transport instanceof WebSocketTransport) {
    window.client.disconnect()
  }
  window.client = new Client(url, { autoConnect: false })
  if (window.client.transport instanceof WebSocketTransport) {
    if (import.meta.env.DEV) {
      console.log('[ctaiyi-repl] setup event listeners')
    }
    window.client.transport.addEventListener('open', () => {
      if (import.meta.env.DEV) {
        console.log('[ctaiyi-repl] client connected')
      }
      config.value.state = 'connected'
      if (config.value.autoDisconnect !== 0) {
        start()
      }
    })

    useEventListener(window.client.transport, 'close', () => {
      if (import.meta.env.DEV) {
        console.log('[ctaiyi-repl] client disconnected')
      }
      config.value.state = 'disconnected'
      stop()
    })
  }
  else if (config.value.state !== 'disconnected') {
    config.value.state = 'disconnected'
    stop()
  }
}
