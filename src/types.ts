import { Context } from 'koishi'
import { Config } from '.'

//记忆配置
export interface MemoryEntry {
  role: string
  content: string
}
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
  metadata?: Record<string, any>
  buy?: (user: UserData, targetItem: ShopItem, amount: number, ctx: Context) => Promise<string | void>
  sell?: (user: UserData, price: number, amount: number, ctx: Context) => Promise<string | void>
  use?: (ItemUsectx: ItemUseContext,cfg: Config, ctx: Context) => Promise<string | void>
}

export interface ItemUseContext {
  user: UserData
  item: UserItem
  args: string[]
}
