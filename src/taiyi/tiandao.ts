export type ZoneType =
  | 'XUKONG'
  | 'YUANYE'
  | 'HUPO'
  | 'NONGTIAN'
  | 'LINDI'
  | 'MILIN'
  | 'YUANLIN'
  | 'SHANYUE'
  | 'DONGXUE'
  | 'SHILIN'
  | 'QIULIN'
  | 'TAOYUAN'
  | 'SANGYUAN'
  | 'XIAGU'
  | 'ZAOZE'
  | 'YAOYUAN'
  | 'HAIYANG'
  | 'SHAMO'
  | 'HUANGYE'
  | 'ANYUAN'
  | 'DUHUI'
  | 'MENPAI'
  | 'SHIZHEN'
  | 'GUANSAI'
  | 'CUNZHUANG'

export interface Zone {
  id: number
  last_grow_vmonth: number
  name: string
  nfa_id: number
  type: ZoneType
}

export interface TianDaoProperties {
  // 基础数值
  id: number
  v_years: number
  v_months: number
  v_times: number
  amount_actor_last_vyear: number
  dead_actor_last_vyear: number
  next_npc_born_time: string

  // 状态值
  cruelty: number
  decay: number
  enjoyment: number
  falsity: number

  // 各区域资源上限地图
  zone_fabric_max_map: number[]
  zone_food_max_map: number[]
  zone_gold_max_map: number[]
  zone_herb_max_map: number[]
  zone_wood_max_map: number[]

  // 各区域资源增长速度地图
  zone_grow_fabric_speed_map: number[]
  zone_grow_food_speed_map: number[]
  zone_grow_gold_speed_map: number[]
  zone_grow_herb_speed_map: number[]
  zone_grow_wood_speed_map: number[]

  // 区域移动难度地图
  zone_moving_difficulty_map: number[]

  // 区域类型连接最大数量地图
  zone_type_connection_max_num_map: [string, ZoneType][]
}
