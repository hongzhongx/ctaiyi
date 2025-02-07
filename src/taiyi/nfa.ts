import type { Asset } from './asset'

export const a: Nfa = {
  active_account: 'sifu',
  children: [
    0,
  ],
  contract_data: [
    [
      {
        key: {
          type: 'lua_string',
          value: {
            v: 'name',
          },
        },
      },
      {
        type: 'lua_string',
        value: {
          v: '太乙宇宙',
        },
      },
    ],
    [
      {
        key: {
          type: 'lua_string',
          value: {
            v: 'pages',
          },
        },
      },
      {
        type: 'lua_table',
        value: {
          v: [
            [
              {
                key: {
                  type: 'lua_int64_t',
                  value: {
                    v: 1,
                  },
                },
              },
              {
                type: 'lua_int64_t',
                value: {
                  v: 0,
                },
              },
            ],
          ],
        },
      },
    ],
    [
      {
        key: {
          type: 'lua_string',
          value: {
            v: 'unit',
          },
        },
      },
      {
        type: 'lua_string',
        value: {
          v: '本',
        },
      },
    ],
  ],
  created_time: '2025-01-20T09:19:54',
  creator_account: 'sifu',
  cultivation_value: 0,
  debt_contract: '',
  debt_value: 0,
  fabric: '0.000000 FABR',
  five_phase: 0,
  food: '0.000000 FOOD',
  gold: '0.000000 GOLD',
  herb: '0.000000 HERB',
  id: 1,
  main_contract: 'contract.nfa.book',
  material_fabric: '0.000000 FABR',
  material_food: '0.000000 FOOD',
  material_gold: '0.000000 GOLD',
  material_herb: '0.000000 HERB',
  material_wood: '0.000000 WOOD',
  next_tick_time: '1969-12-31T23:59:59',
  owner_account: 'hongzhong',
  parent: '9223372036854775807',
  qi: '0.000000 QI',
  symbol: 'nfa.jingshu.book',
  wood: '0.000000 WOOD',
}

export interface LuaString {
  type: 'lua_string'
  value: {
    v: string
  }
}

export interface LuaInt64T {
  type: 'lua_int64_t'
  value: {
    v: number
  }
}

export interface LuaTable {
  type: 'lua_table'
  value: {
    v: [{ key: LuaValue }, LuaValue][]
  }
}

export type LuaValue = LuaString | LuaInt64T | LuaTable | (LuaString | LuaInt64T | LuaTable)[]

export interface Nfa {
  id: number
  symbol: string
  main_contract: string

  children: number[]
  contract_data: [{ key: LuaValue }, LuaValue][]

  created_time: string
  next_tick_time: string

  creator_account: string
  owner_account: string
  active_account: string
  parent: string

  cultivation_value: number
  debt_contract: string
  debt_value: number

  qi: Asset | string

  fabric: Asset | string
  food: Asset | string
  gold: Asset | string
  herb: Asset | string
  wood: Asset | string

  material_fabric: Asset | string
  material_food: Asset | string
  material_gold: Asset | string
  material_herb: Asset | string
  material_wood: Asset | string

  five_phase: number
}
