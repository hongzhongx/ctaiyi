export async function define(deps: string[], fn: (...args: any[]) => any) {
  const args = await Promise.all(
    deps.map(async (dep) => {
      if (dep === '@taiyinet/ctaiyi') {
        return await import('@taiyinet/ctaiyi')
      }
      const mod = await import(`https://esm.sh/${dep}`)
      return 'default' in mod ? mod.default : mod
    }),
  )
  return fn(...args)
}
