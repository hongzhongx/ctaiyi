import type { Asset } from './asset'

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
