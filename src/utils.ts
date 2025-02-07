/**
 * @file Misc utility functions.
 */

export function waitForEvent<T>(target: EventTarget, event: string): Promise<T> {
  return new Promise<T>((resolve) => {
    target.addEventListener(
      event,
      (e) => {
        resolve(e as T)
      },
      { once: true },
    )
  })
}

export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function iteratorStream<T>(iterator: AsyncIterableIterator<T>): ReadableStream<T> {
  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next()
        if (done) {
          controller.close()
        }
        else {
          controller.enqueue(value)
        }
      }
      catch (error) {
        controller.error(error)
      }
    },
  })
}
