import { utils } from '../src'

describe('misc', () => {
  vi.setConfig({
    testTimeout: 60 * 1000
  })
  describe('iteratorStream', () => {
    async function* counter(to: number) {
      for (let i = 0; i < to; i++) {
        yield { i }
      }
    }

    async function* errorCounter(to: number, errorAt: number) {
      for (let i = 0; i < to; i++) {
        yield { i }
        if (errorAt === i) {
          throw new Error('Oh noes')
        }
      }
    }

    it('should handle backpressure', async () => {
      await new Promise<void>((resolve, reject) => {
        const transformStream = new TransformStream({
          transform(chunk, controller) {
            controller.enqueue(chunk);
          }
        });
        const s2 = utils.iteratorStream(counter(100));

        let c = 0;
        const reader = transformStream.readable.getReader();

        s2.pipeTo(transformStream.writable);

        (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                assert(c === 99)
                resolve()
                break
              }
              c = value.i;
            }
          } catch (err) {
            reject(err);
          }
        })();
      })
    })

    it('should handle errors', async () => {
      await new Promise<void>((resolve) => {
        const s = utils.iteratorStream(errorCounter(10, 2))
        let last = 0
        let sawError = false

        ;(async () => {
          try {
            const reader = s.getReader()
            while (true) {
              try {
                const { done, value } = await reader.read()
                if (done) break
                last = value.i
              } catch {
                assert(last === 2)
                sawError = true
                break
              }
            }
            assert(sawError)
            resolve()
          } catch (err) {
            console.error('Stream reading error:', err)
          }
        })()
      })
    })
  })
})
