export interface Actor {
  age: number
  agility: number
  agility_max: number
  base_name: string
  born: boolean
  born_time: string
  born_vmonths: number
  born_vtimes: number
  born_vyears: number
  charm: number
  charm_max: number
  comprehension: number
  comprehension_max: number
  fertility: number
  five_phase: number
  gender: number
  health: number
  health_max: number
  id: number
  init_attribute_amount_max: number
  last_update: string
  location: string
  loyalty: number
  mood: number
  mood_max: number
  name: string
  next_tick_time: string
  nfa_id: number
  physique: number
  physique_max: number
  sexuality: number
  standpoint: number
  standpoint_type: string
  strength: number
  strength_max: number
  // TODO(@enpitsulin): 后面可以改成具名元组
  talents: [number, number][]
  vitality: number
  vitality_max: number
  willpower: number
  willpower_max: number
}

export interface ActorTalentRule {
  id: number
  title: string
  description: string
  removed: boolean
  init_attribute_amount_modifier: number
  max_triggers: number
  main_contract: number
  created: string
  last_update: string
}
