document.addEventListener('keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey))
    return
  if (!['=', '-'].includes(e.key))
    return

  const options = {
    key: e.key,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
  }
  const keyboardEvent = new KeyboardEvent('keydown', options)
  window.parent.document.dispatchEvent(keyboardEvent)

  e.preventDefault()
}, true)
