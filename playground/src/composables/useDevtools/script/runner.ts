/* eslint-disable no-console */
import type Chobitsu from 'chobitsu'
import { Client, WebSocketTransport } from '@taiyinet/ctaiyi'
import { debouncedWatch, useEventListener, useTimeoutFn } from '@vueuse/core'
import { useClientConfig, useClientState } from '../client-state'

declare const chobitsu: typeof Chobitsu

declare global {
  interface Window {
    dispose?: () => void
    client?: import('@taiyinet/ctaiyi').Client
  }
}

const { post: postToConnectingBC } = useClientState()

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

    window.client.disconnect()
  },
  () => config.value.autoDisconnect ?? Number.POSITIVE_INFINITY,
  { immediate: false },
)

debouncedWatch(config, (value) => {
  if (import.meta.env.DEV) {
    console.log('[ctaiyi-repl] update runner config', value)
  }
  if (!window.client) {
    console.warn('[ctaiyi-repl] ctaiyi client not initialized yet')
    return
  }
  // @ts-expect-error: override url
  window.client.url = value.url

  if (value.autoDisconnect === 0) {
    stop()
  }
  else {
    start()
  }
}, { debounce: 500 })

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
      attachClientInstance()
    }
  }
  catch (e) {
    console.error(e)
  }
})

function attachClientInstance() {
  window.client = new Client(config.value.url, { autoConnect: false })
  if (window.client.transport instanceof WebSocketTransport) {
    useEventListener(window.client.transport, 'open', () => {
      if (import.meta.env.DEV) {
        console.log('[ctaiyi-repl] client connected')
      }
      postToConnectingBC(true)
      if (config.value.autoDisconnect !== 0) {
        start()
      }
    })

    useEventListener(window.client.transport, 'close', () => {
      if (import.meta.env.DEV) {
        console.log('[ctaiyi-repl] client disconnected')
      }
      postToConnectingBC(false)
      stop()
    })
  }
}
