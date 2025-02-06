import { randomBytes } from 'crypto'
import * as fs from 'node:fs/promises'
import process from 'node:process'

export const NUM_TEST_ACCOUNTS = 2
export const TEST_NODE = process.env.TEST_NODE || 'http://127.0.0.1:8091'

export function randomString(length: number) {
  return randomBytes(length * 2)
    .toString('base64')
    .replace(/[^0-9a-z]+/gi, '')
    .slice(0, length)
    .toLowerCase()
}

export async function createAccount(): Promise<{ username: string, password: string }> {
  const password = randomString(32)
  const username = `ctaiyi-${randomString(9)}`
  const response = await fetch('http://47.109.49.30:8080/create', {
    method: 'POST',
    body: `username=${username}&password=${password}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  const text = await response.text()
  if (response.status !== 200) {
    throw new Error(`Unable to create user: ${text}`)
  }
  return { username, password }
}

export async function getTestnetAccounts(): Promise<{ username: string, password: string }[]> {
  try {
    const data = await fs.readFile('.testnetrc')
    return JSON.parse(data.toString())
  }
  catch (error) {
    if ((error as any).code !== 'ENOENT') {
      throw error
    }
  }

  const rv: { username: string, password: string }[] = []
  while (rv.length < NUM_TEST_ACCOUNTS) {
    rv.push(await createAccount())
  }

  // eslint-disable-next-line no-console
  console.log(`CREATED TESTNET ACCOUNTS: ${rv.map(i => i.username)}`)

  await fs.writeFile('.testnetrc', JSON.stringify(rv))

  return rv
}
