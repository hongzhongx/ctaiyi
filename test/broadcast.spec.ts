import { Client } from './../src'

import { agent, getTestnetAccounts } from './common'

describe('broadcast', function () {
  this.slow(10 * 1000)
  this.timeout(60 * 1000)

  const client = Client.testnet({ agent })

  let acc1, acc2: { username: string, password: string }
  before(async () => {
    [acc1, acc2] = await getTestnetAccounts()
  })
})
