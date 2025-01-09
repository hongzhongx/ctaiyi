const ctaiyi = require('@taiyinet/ctaiyi')

// bot is configured with enviroment variables

// the username of the bot
const BOT_USER = process.env['BOT_USER'] || die('BOT_USER missing')
// the user we want to track
const TRACK_ACCOUNT = process.env['TRACK_ACCOUNT'] || die('TRACK_ACCOUNT missing')

// setup the ctaiyi client, you can use other nodes
const client = new ctaiyi.Client('http://127.0.0.1:8091')

// create a new readable stream with all operations, we use the 'latest' mode since
// we don't care about reversed block that much for a simple watch bot
// and this will make it react faster to the transfer of it's master
const stream = client.blockchain.getOperationsStream({mode: ctaiyi.BlockchainMode.Latest})

console.log(`Tracking ${ TRACK_ACCOUNT } with transfer op`)

// the stream will emit one data event for every operatio that happens on the taiyi blockchain
stream.on('data', (operation) => {
    // we only care about trasfer operations made by the user we track
    if (operation.op[0] == 'transfer') {
        let op = operation.op[1]
        if (op.from === TRACK_ACCOUNT) {
            console.log(`${ op.from } transfer ${ op.amount } to ${ op.to  }.`)
        }
        else if(op.to === TRACK_ACCOUNT) {
            console.log(`${ op.to } receive ${ op.amount } from ${ op.from  }.`)
        }
    }
})

function die(msg) { process.stderr.write(msg+'\n'); process.exit(1) }
