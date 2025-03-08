import type { LegacyAsset } from './asset'

export interface LuaBool {
  type: 'lua_bool'
  value: {
    v: boolean
  }
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

export type LuaValue = LuaBool | LuaString | LuaInt64T | LuaTable | (LuaBool | LuaString | LuaInt64T | LuaTable)[]

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

  qi: LegacyAsset

  fabric: LegacyAsset
  food: LegacyAsset
  gold: LegacyAsset
  herb: LegacyAsset
  wood: LegacyAsset

  material_fabric: LegacyAsset
  material_food: LegacyAsset
  material_gold: LegacyAsset
  material_herb: LegacyAsset
  material_wood: LegacyAsset

  five_phase: number
}
