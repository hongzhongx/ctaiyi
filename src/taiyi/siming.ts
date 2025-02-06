export interface ScheduleSiming {
  current_shuffled_simings: string[]
  current_virtual_time: string
  elected_weight: number
  hardfork_required_simings: number
  id: number
  majority_version: string
  max_adored_simings: number
  median_props: {
    account_creation_fee: string
    maximum_block_size: number
  }
  miner_weight: number
  next_shuffle_block_num: number
  num_scheduled_simings: number
  siming_pay_normalization_factor: number
  timeshare_weight: number
}

export interface Siming {
  adores: number
  created: string
  hardfork_time_vote: string
  hardfork_version_vote: string
  id: number
  last_aslot: number
  last_confirmed_block_num: number
  owner: string
  props: {
    account_creation_fee: string
    maximum_block_size: number
  }
  running_version: string
  signing_key: string
  total_missed: number
  url: string
  virtual_last_update: string
  virtual_position: string
  virtual_scheduled_time: string
}
