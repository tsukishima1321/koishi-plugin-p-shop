import { Schema, Context } from 'koishi'

//记忆配置
export interface MemoryEntry {
  role: string
  content: string
}
export interface Config {
  dataDir: string
}

export const Config: Schema<Config> = Schema.object({
  dataDir: Schema.string().default("./data").description("数据目录"),
})

export interface UserData {
  id: number
  userid: string
  usersname: string
  p: number
  deadTime: Date
  exchangeTime: Date
  favorability: number
  items?: Record<string, UserItem>
}

// 道具数据模型
export interface UserItem {
  id: string
  count: number
  price: number
  favorability?: number
  description?: string
  metadata?: Record<string, any>
}

export interface ShopItem {
  id: string
  description: string
  price: number
  maxStack: number
  favorability: number
  onBuy?: (user: UserData, amount: number, targetItem: ShopItem, ctx: Context) => Promise<string | void>
  onSell?: (user: UserData, amount: number, shopItem: ShopItem, ctx: Context) => Promise<string | void>
  onUse?: (ItemUsectx: ItemUseContext, ctx: Context) => Promise<string | void>
}

export interface ItemUseContext {
  user: UserData
  item: UserItem
  args: string[]
}
