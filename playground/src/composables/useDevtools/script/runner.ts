/* eslint-disable no-console */
import type Chobitsu from 'chobitsu'

declare global {
  interface Window {
    dispose?: () => void
    client?: import('@taiyinet/ctaiyi').Client
  }

  const chobitsu: typeof Chobitsu
}

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
