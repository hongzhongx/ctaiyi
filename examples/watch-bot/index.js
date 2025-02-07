/* eslint-disable no-console */
import process from 'node:process'
import { BlockchainMode, Client } from '@taiyinet/ctaiyi'

process.loadEnvFile('.env')

const TRACK_ACCOUNT = process.env.TRACK_ACCOUNT || die('TRACK_ACCOUNT missing')

const client = Client.testnet()

const stream = client.blockchain.getOperationsStream({ mode: BlockchainMode.Latest })

console.log(`Tracking ${TRACK_ACCOUNT} with transfer op`)

stream.getReader().read().then(({ done, value }) => {
  if (done) {
    die('stream close')
  }

  if (value) {
    if (value.op[0] === 'transfer') {
      const op = value.op[1]
      if (op.from === TRACK_ACCOUNT) {
        console.log(`${op.from} transfer ${op.amount} to ${op.to}.`)
      }
      else if (op.to === TRACK_ACCOUNT) {
        console.log(`${op.to} receive ${op.amount} from ${op.from}.`)
      }
    }
  }
})

/**
 * @param {string} msg
 */
function die(msg) {
  process.stderr.write(`${msg}\n`)
  process.exit(1)
}
