// TODO：还没有实现，等待实现账号创建Web服务
import 'mocha'
import * as assert from 'assert'
import * as lorem from 'lorem-ipsum'
import {VError} from 'verror'

import {Client, PrivateKey, utils} from './../src'

import {getTestnetAccounts, randomString, agent} from './common'

describe('broadcast', function() {
    this.slow(10 * 1000)
    this.timeout(60 * 1000)

    const client = Client.testnet({agent})

    let acc1, acc2: {username: string, password: string}
    before(async function() {
        [acc1, acc2] = await getTestnetAccounts()
    })

})
