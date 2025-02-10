import ctaiyiUrl from '@taiyinet/ctaiyi?url'
import { useEventListener } from '@vueuse/core'
import { onScopeDispose, ref, watchPostEffect } from 'vue'
import { isDark } from '../dark'
import { injectDevtools } from './devtoolsInject'

function dispatchKeyboardEventToParentZoomState() {
  return `
  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (!['=', '-'].includes(e.key)) return;

    const options = {
      key: e.key,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
    };
    const keyboardEvent = new KeyboardEvent('keydown', options);
    window.parent.document.dispatchEvent(keyboardEvent);

    e.preventDefault();
  }, true);
`
}

function generateHTML() {
  return `
    <!doctype html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script type="importmap">
       {
          "imports": {
            "@noble/hashes": "https://esm.sh/@noble/hashes@1.7.1",
            "@noble/hashes/": "https://esm.sh/@noble/hashes@1.7.1/",
            "@noble/secp256k1": "https://esm.sh/@noble/secp256k1@2.2.3",
            "tiny-invariant": "https://esm.sh/tiny-invariant@1.3.3",
            "bs58": "https://esm.sh/bs58@6.0.0",
            "bytebuffer": "https://esm.sh/bytebuffer@5.0.1",
            "defu": "https://esm.sh/defu@6.1.4",
            "@taiyinet/ctaiyi": ${JSON.stringify(new URL(ctaiyiUrl, import.meta.url).href)}
          }
        }
        </script>
      <script src="https://cdn.jsdelivr.net/npm/chobitsu"></script>
      <script type="module">
        window.addEventListener('message', ({ data }) => {
          const { event, value } = data;

          if (event !== 'CODE_UPDATE') return;
 
          window.dispose?.();
          window.dispose = undefined;
          
          console.clear();

          document.getElementById('runner')?.remove();
          const script = document.createElement('script');
          script.id = 'runner';
          script.type = 'module';
          script.textContent = value;
          document.body.appendChild(script);
        });

        const sendToDevtools = (message) => {
          window.parent.postMessage(JSON.stringify(message), '*');
        };
        let id = 0;
        const sendToChobitsu = (message) => {
          message.id = 'tmp' + ++id;
          chobitsu.sendRawMessage(JSON.stringify(message));
        };
        chobitsu.setOnMessage((message) => {
          if (message.includes('"id":"tmp')) return;
          window.parent.postMessage(message, '*');
        });
        window.addEventListener('message', ({ data }) => {
          try {
            const { event, value } = data;
            if (event === 'DEV') {
              chobitsu.sendRawMessage(data.data);
            } else if (event === 'LOADED') {
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
              });
              sendToChobitsu({ method: 'Network.enable' });
              sendToDevtools({ method: 'Runtime.executionContextsCleared' });
              sendToChobitsu({ method: 'Runtime.enable' });
              sendToChobitsu({ method: 'Debugger.enable' });
              sendToChobitsu({ method: 'DOMStorage.enable' });
              sendToChobitsu({ method: 'DOM.enable' });
              sendToChobitsu({ method: 'CSS.enable' });
              sendToChobitsu({ method: 'Overlay.enable' });
              sendToDevtools({ method: 'DOM.documentUpdated' });
            }
          } catch (e) {
            console.error(e);
          }
        });

        ${dispatchKeyboardEventToParentZoomState()}
      </script>
    </head>
    <body>
      <script id="runner" type="module"></script>
    </body>
  </html>`
}

const INJECT_SCRIPT = `(${injectDevtools.toString()})()`

export function useDevtoolsSrc() {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <meta charset="utf-8">
  <title>DevTools</title>
  <style>
    @media (prefers-color-scheme: dark) {
      body {
        background-color: rgb(41 42 45);
      }
    }
  </style>
  <script>
    ${dispatchKeyboardEventToParentZoomState()}
  </script>
  <script>
    ${INJECT_SCRIPT}
  </script>
  <meta name="referrer" content="no-referrer">
  <script src="https://unpkg.com/@ungap/custom-elements/es.js"></script>
  <script type="module" src="https://cdn.jsdelivr.net/npm/chii@1.12.3/public/front_end/entrypoints/chii_app/chii_app.js"></script>
  <body class="undocked" id="-blink-dev-tools">`
  const devtoolsRawUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }))

  const runnerIframeSrcUrl = URL.createObjectURL(new Blob([generateHTML()], { type: 'text/html' }))

  onScopeDispose(() => {
    URL.revokeObjectURL(devtoolsRawUrl)
    URL.revokeObjectURL(runnerIframeSrcUrl)
  })

  const devtoolsLoaded = ref(false)

  const runnerIframe = ref<HTMLIFrameElement | null>(null)
  const devtoolsIframe = ref<HTMLIFrameElement | null>(null)
  const runnerLoaded = ref(false)

  useEventListener(window, 'message', (event) => {
    const fromRunner = event.source === runnerIframe.value?.contentWindow
    const fromDevtools = event.source === devtoolsIframe.value?.contentWindow
    if (fromRunner) {
      devtoolsIframe.value?.contentWindow?.postMessage(event.data, '*')
    }
    if (fromDevtools) {
      runnerIframe.value?.contentWindow?.postMessage({ event: 'DEV', data: event.data }, '*')
    }
  })

  useEventListener(runnerIframe, 'load', () => {
    runnerLoaded.value = true
  })

  useEventListener(devtoolsIframe, 'load', () => {
    devtoolsLoaded.value = true
  })

  watchPostEffect(() => {
    if (devtoolsLoaded.value && runnerLoaded.value)
      runnerIframe.value?.contentWindow?.postMessage({ event: 'LOADED' }, '*')
  })

  watchPostEffect(() => {
    localStorage.setItem('uiTheme', isDark.value ? '"dark"' : '"default"')
    devtoolsIframe.value?.contentWindow?.location.reload()
  })

  return {
    runnerIframeSrcUrl,
    devtoolsRawUrl: `${devtoolsRawUrl}#?embedded=${encodeURIComponent(location.origin)}`,
    refs: {
      runnerIframe,
      devtoolsIframe,
    },
  }
}
