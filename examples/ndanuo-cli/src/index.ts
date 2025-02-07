/* eslint-disable no-console */
import assert from 'node:assert'
import process from 'node:process'
import * as readline from 'readline'
import { Client, ClientMessageError, PrivateKey } from '@taiyinet/ctaiyi'
import * as ANSI from './ansi'

const client = Client.testnet()

console.log(`-- ${ANSI.YEL}大傩实验客户端${ANSI.NOR} --`)

let account_name = ''
let private_key: PrivateKey | null = null
let play_nfa: number | null = null

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ANSI.ansi(`${ANSI.BLU}=> ${ANSI.NOR}`),
})

console.log('请使用账号密码进行登录，命令是“login 账号名 密码”。')
rl.prompt()

rl.on('line', async (input) => {
  if (input.trim() === 'exit') {
    rl.close() // 输入 'exit' 时退出循环
  }
  else {
    let args = input.split(/\s+/)
    // console.log(`解析输入：${args}`);
    const action = args[0]

    if (action === 'login') {
      account_name = args[1]
      const approving_account_objects = await client.baiyujing.getAccounts([account_name])
      if (approving_account_objects.length === 0 || approving_account_objects[0].name == null) {
        console.warn(`账号${ANSI.YEL}${account_name}${ANSI.NOR}不存在，你可以使用命令“signup 账号名 账号密码”创建新账号。\n`)
        rl.prompt()
        return
      }

      const pass = args[2]
      const privateKey = PrivateKey.fromLogin(account_name, pass, 'active')
      const activeKey = privateKey.createPublic('TAI')

      const approving_acct = approving_account_objects[0]
      if (activeKey.toString() !== approving_acct.active.key_auths[0][0]) {
        console.warn(`你的密码对该账号无效，请重新登录。\n`)
        rl.prompt()
        return
      }

      private_key = privateKey
      console.log(`登录成功。${private_key.toString()}`)

      const actors = await client.baiyujing.listActors(account_name, 100)
      const actor_names = actors.map((actor, index) => `${index + 1} ——【${actor.name}】`).join('\n    ')
      console.log(`当前账号${ANSI.YEL}${account_name}${ANSI.NOR}有以下角色：\n    ${ANSI.BLU}${actor_names}${ANSI.NOR}`)
      console.log('请选择角色，命令是“play 角色名称 | NFA序号”。')
      console.log('如果要创建新角色，命令是“new 角色姓氏 角色名”。\n')

      rl.prompt()
      return
    }

    if (action === 'signup') {
      account_name = args[1]
      const pass = args[2]
      try {
        console.log(`正在创建账号${ANSI.YEL}${account_name}${ANSI.NOR}中...`)
        const s = await createAccount(account_name, pass)
        if (s.status === true) {
          const results = await client.baiyujing.evalNfaActionWithStringArgs(s.new_nfa, 'short', '[]')
          // const nfa = await taiyi.api.findNfaAsync(s.new_nfa);
          const eval_result = results.eval_result[0]
          assert(!Array.isArray(eval_result))
          console.log(`创建账号${ANSI.YEL}${account_name}${ANSI.NOR}成功，系统还赠送了一个法宝${ANSI.BLU}${eval_result.value.v}${ANSI.NOR}（NFA序号=#${s.new_nfa}）。`)

          const [newAcc] = await client.baiyujing.getAccounts([account_name])
          console.log(`${ANSI.YEL}${account_name}${ANSI.NOR}真气量为${ANSI.GRN}${newAcc.qi}${ANSI.NOR}`)

          console.log(`请使用login命令登录账号。\n`)
        }
        else {
          console.log(`创建账号${ANSI.YEL}${account_name}${ANSI.NOR}失败了！\n`)
        }
      }
      catch (err) {
        if (err instanceof Error) {
          console.log(err.toString())
          if (err.cause)
            console.log(err.cause)
        }
        console.log(`创建账号${ANSI.YEL}${account_name}${ANSI.NOR}失败了！\n`)
      };
      rl.prompt()
      return
    }

    if (account_name === '' || private_key === null) {
      console.log('请使用账号密码进行登录，命令是“login 账号名 密码”。\n')
      rl.prompt()
      return
    }

    if (action === 'new') {
      // new 角色姓氏 角色名
      const family_name = args[1]
      const last_name = args[2]
      try {
        await client.broadcast.sendOperations(
          [
            [
              'account_create',
              {
                // fee: chainProps.account_creation_fee,
                family_name: `${family_name}${last_name}`,
                last_name: private_key,
                creator: account_name,
              },
            ],
          ],
          private_key,
        )
      }
      catch (err) {
        if (err instanceof ClientMessageError) {
          console.log(err.toString())
          if (err.cause)
            console.log(JSON.stringify(err.cause))
        }
        console.log(`创建角色失败了！\n`)
        rl.prompt()
        return
      };

      console.log(`创建角色${ANSI.YEL}${family_name}${last_name}${ANSI.NOR}成功。`)
      console.log(`请操作法宝来出生角色和升级角色，然后可以使用play命令夺舍这个角色开始游戏。\n`)
      rl.prompt()
      return
    }

    if (action === 'play') {
      if (isInteger(args[1])) {
        play_nfa = Number.parseInt(args[1], 10)
        const results = await client.baiyujing.evalNfaActionWithStringArgs(play_nfa, 'short', '[]')
        assert(!Array.isArray(results.eval_result[0]))
        console.log(`你好，${ANSI.YEL}${results.eval_result[0].value.v}${ANSI.NOR}（#${play_nfa}）。`)
        console.log(`注意，你的元神现在在一个物品里面，不要做出太出格的事情。\n`)
        rl.prompt()
      }
      else {
        const actor_name = args[1]
        console.log(`开始游玩角色${ANSI.YEL}${actor_name}${ANSI.NOR}...`)
        const actor_info = await client.baiyujing.findActor(actor_name)
        if (actor_info === null) {
          console.warn(`角色${ANSI.YEL}${actor_name}${ANSI.NOR}不存在。\n`)
        }
        else {
          play_nfa = actor_info.nfa_id
          const res = await client.baiyujing.evalNfaActionWithStringArgs(play_nfa, 'welcome', '[]')
          const results = res.narrate_logs
          console.log(ANSI.ansi(results.join(`\n${ANSI.NOR}`)))
          console.log(`你好，${ANSI.YEL}${actor_name}${ANSI.NOR}，欢迎来到大傩世界。\n`)
        }
      }

      rl.prompt()
      return
    }

    if (!play_nfa) {
      console.log('请选择角色或者NFA，命令是“play 角色名称|NFA序号”。\n')
      rl.prompt()
      return
    }

    // 开始对nfa执行命令
    try {
      // 重新按action命令格式解析输入为[命令字符串, 参数字符串]
      args = splitInputAsAction(input)
      const params = args[1]

      const info = await client.baiyujing.getNfaActionInfo(play_nfa, action)
      if (info.exist === false) {
        console.log(`实体没有这个行为`)
        rl.prompt()
        return
      }

      let results: string[] = []
      if (info.consequence === true) {
        const tx = await client.broadcast.sendOperations(
          [
            ['action_nfa', {
              caller: account_name,
              id: play_nfa,
              action,
              value_list: [params],
              extensions: [],
            }],
          ],
          private_key,
        )
        const tx_result = await client.baiyujing.getTransactionResults(tx.id) as any
        tx_result.forEach((result: any) => {
          // console.log(JSON.stringify(result));
          if (result.type === 'contract_result') {
            const cresult = result.value
            cresult.contract_affecteds.forEach((affect: any) => {
              if (affect.type === 'contract_narrate') {
                results.push(affect.value.message)
              }
            })
          }
        })
      }
      else {
        results = (await client.baiyujing.evalNfaActionWithStringArgs(play_nfa, action, params)).narrate_logs
      }

      let ss = ''
      results.forEach((result) => {
        ss += `${result}\n${ANSI.NOR}`
      })

      ss = ANSI.ansi(ss)
      console.log(ss)
    }
    catch (err) {
      // 对特定错误信息，识别解析出来直接显示
      const es: string = (err as Error).toString()
      const p1 = es.indexOf('#t&&y#')
      const p2 = es.indexOf('#a&&i#')
      if (p1 !== -1 && p2 !== -1) {
        let ss = `${es.substring(p1 + 6, p2)}\n${ANSI.NOR}`
        ss = ANSI.ansi(ss)
        console.log(ss)
      }
      else {
        console.log(es)
      }
      // console.log(err.payload);
    };
    rl.prompt()
  }
})

rl.on('close', () => {
  console.log('\n再见！')
  process.exit(0) // 退出程序
})

///////////////////////////////////////////////////////////////////////////////
function isInteger(str: any) {
  const num = Number.parseInt(str, 10)
  return !Number.isNaN(num) && Number.isFinite(num) && Number.isInteger(num)
}

function splitInputAsAction(input: string): string[] {
  // 使用正则表达式匹配第一个空格前的内容和之后的内容
  const match = input.match(/^([^ ]+) (.+)$/)

  if (match) {
    return [match[1], match[2]]
  }
  else {
    throw new Error('#t&&y#输入命令格式错误，请重新输入！#a&&i#')
  }
}

async function createAccount(username: string, password: string) {
  const response = await fetch('http://47.109.49.30:8080/create', {
    method: 'POST',
    body: `username=${username}&password=${password}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  if (response.status !== 200) {
    console.log(response)
    throw new Error(`Unable to create user: ${username}`)
  }
  return response.json()
}
