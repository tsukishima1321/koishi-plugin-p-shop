import { Context, h, Schema, Session, Time } from 'koishi'
import * as fs from 'fs'
import * as path from 'path'
export const name = 'p-shop'

export const usage = `
- **指令：p-shop**\n
    别名：p点商店\n
    `;

export const inject = {
  required: ['database'],
  optional: [],
}

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
declare module 'koishi' {
  interface Tables {
    p_system: UserData
  }
}

interface UserData {
  id: number
  userid: string
  usersname: string
  p: number
  time: Date
  favorability: number
  items?: Record<string, ItemInfo>
}

// 道具数据模型
interface ItemInfo {
  id: string;
  count: number;
  price: number;
  description?: string;
  favorability_limit?: number;
}

export function apply(ctx: Context, cfg: Config) {
  // 初始化数据库
  ctx.model.extend('p_system', {
    id: 'unsigned',
    userid: 'string',
    usersname: 'string',
    p: 'integer',
    time: 'timestamp',
    favorability: 'integer',
    items: 'object'
  }, { autoInc: true })
  const shop = new ShopService(ctx, cfg)
  ctx.command('p/p-shop').alias('查看商店')
    .action(async ({ session }) => {return await shop.viewShop(session.userId) })
  ctx.command('p/p-bag').alias('查看背包')
    .action(async ({ session }) => {return await shop.viewBag(session.userId) })
  ctx.command('p/p-buy <id> [amount:number]').alias('购买道具')
    .action(async ({ session }, id, amount = 1) => {return await shop.buyItem(session.userId, id, amount) })
  ctx.command('p/p-sell <id> [amount:number]').alias('出售道具')
    .action(async ({ session }, id, amount = 1) => {return await shop.sellItem(session.userId, id, amount) })
  ctx.command('p/p-use <id> [...args]').alias('使用道具')
    .action(async ({ session }, id, args) => {return await shop.useItem(session.userId, id, args ? args.split(' ') : []) })
}

// 数据库服务
class DatabaseService {
  constructor(private ctx: Context, private config: Config) {}

  async getUser(userId: string): Promise<UserData> {
    const [user] = await this.ctx.database.get('p_system', { userid: userId })
    return user
  }

  async updateUser(userId: string, data: Partial<UserData>): Promise<void> {
    await this.ctx.database.set('p_system', { userid: userId }, {
      p: data.p,
      favorability: data.favorability,
      items: data.items
    })
  }
}

// 商店服务
class ShopService{
  private db: DatabaseService
  constructor(private ctx: Context, private config: Config) {
    this.db = new DatabaseService(ctx, config)
    this.ensureShopFile(path.resolve(config.dataDir, 'p-shop.json'))
  }

  // 获取商店道具
  async getItems(): Promise<Record<string, ItemInfo>> {
    return await this.loadShopFile(path.resolve(this.config.dataDir, 'p-shop.json'))
  }

  // 查看商店
  async viewShop(userId: string): Promise<string> {
    const user = await this.db.getUser(userId)
    if (!user) return '请先签到再查看商店哦'
    const item = await this.getItems()
    if (!item) return '商店为空'

    let message = '当前可购买的道具列表：\n'
    for (const key in item) {
      if (item[key].favorability_limit > user.favorability) continue
      message += `${item[key].id} \n ${item[key].description} \n 价格：${item[key].price}P\n\n`
    }
    return message
  }

  // 查看背包
  async viewBag(userId: string): Promise<string> {
    const user = await this.db.getUser(userId)
    if (!user) return '请先签到再查看背包哦'
    if (!user.items || Object.keys(user.items).length === 0) return '你的背包为空'

    let message = '当前背包中的道具列表：\n'
    for (const key in user.items) {
      const item = user.items[key]
      message += `${item.id} \n 数量：${item.count} - 价格：${item.price}P\n\n`
    }
    return message
  }

  // 购买道具
  async buyItem(userId: string, itemId: string, amount: number): Promise<void | string> {
    const user = await this.db.getUser(userId)
    if (!user) return '请先签到再购买物品哦'
    const items = await this.getItems()
    if (!items) return '商店为空'
    if (!items[itemId]) return '物品不存在'
    if (amount < 1) return '购买数量必须大于0'
    const item = items[itemId]
    if (user.p < item.price * amount) return 'P点不足，无法购买此物品'
    if (user.favorability < item.favorability_limit) return '好感度不足，无法购买此物品'
    const userItemCount = user.items[itemId] ? user.items[itemId].count : 0
    if (item.count < userItemCount + amount) return '超出此物品持有上限' + item.count
    user.p -= item.price * amount
    if (!user.items) user.items = {}
    if (!user.items[itemId]) user.items[itemId] = { id: itemId, count: 0, price: item.price }
    user.items[itemId].count += amount
    user.items[itemId].price = item.price
    await this.db.updateUser(userId, user)
    return '购买成功'
  }

  // 出售道具
  async sellItem(userId: string, itemId: string, amount: number): Promise<void | string> {
    const user = await this.db.getUser(userId)
    if (!user) return '请先签到再出售物品哦'
    if (!user.items) return '背包为空'
    if (!user.items[itemId]) return '物品不存在'
    if (amount < 1) return '出售数量必须大于0'
    const shopItems = await this.getItems()
    const item = user.items[itemId]
    let price = 0
    if (shopItems[itemId])
      price = shopItems[itemId].price
    else
      price = item.price
    if (item.count < amount) return '物品数量不足'
    user.p += price * amount
    item.count -= amount
    if (item.count === 0) delete user.items[itemId]
    await this.db.updateUser(userId, user)
    return '出售成功,你获得了' + price * amount + 'P点'
  }

  // 使用道具
  async useItem(userId: string, itemId: string, args: string[]): Promise<void | string> {
    const user = await this.db.getUser(userId)
    if (!user) return '请先签到再使用物品哦'
    if (!user.items) return '背包为空'
    if (!user.items[itemId]) return '物品不存在'
    const item = user.items[itemId]
    if (item.id === '败者食尘') {
      user.favorability = 0
      // 删除全部记忆
      const filePath = this.getUserMemoryPath(userId)
      await this.ensureMemoryFile(filePath)
      fs.writeFileSync(filePath, JSON.stringify([], null, 2))
      item.count -= 1
      if (item.count === 0) delete user.items[itemId]
      await this.db.updateUser(userId, user)
      return '使用成功，已清空所有好感度和记忆'
    }
    if (item.id === '消忆药水') {
      if (!args || args.length === 0) return '请提供一个词'
      if (args[0].length != 2) return '词语长度必须为2个字符'
      // 删除与一个词相关的记忆
      const filePath = this.getUserMemoryPath(userId)
      await this.ensureMemoryFile(filePath)
      const memories = await this.loadMemoryFile(filePath)
      const filtered = memories.filter(entry => !entry.content.includes(args[0]))
      fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2))
      item.count -= 1
      if (item.count === 0) delete user.items[itemId]
      await this.db.updateUser(userId, user)
      return `使用成功，已删除与${args[0]}相关的记忆`
    }
    if (item.id === '空白符卡') {
      let bonusLevel = ''
      let bonusP = 0
      let cardName = ''
      const randomNum = random(1, 100)
      if (randomNum > 0  && randomNum <= 1)   { bonusLevel = 'SSR'; bonusP = 199999; cardName = '极品符卡' }
      if (randomNum > 1  && randomNum <= 6)   { bonusLevel = 'SR' ; bonusP = 59999 ; cardName = '上品符卡' }
      if (randomNum > 6  && randomNum <= 31)  { bonusLevel = 'R'  ; bonusP = 14999 ; cardName = '普通符卡' }
      if (randomNum > 31 && randomNum <= 85)  { bonusLevel = 'N'  ; bonusP = 4599  ; cardName = '下品符卡' }
      if (randomNum > 85 && randomNum <= 98)  { bonusLevel = 'G'  ; bonusP = 1999  ; cardName = '劣质符卡' }
      if (randomNum > 98 && randomNum <= 100) { bonusLevel = 'GG' ; bonusP = 9     ; cardName = '垃圾符卡' }
      if (!user.items[cardName]) user.items[cardName] = { id: cardName, count: 0, price: bonusP }
      user.items[cardName].count += 1
      user.items['空白符卡'].count -= 1
      if (user.items['空白符卡'].count <= 0) delete user.items['空白符卡']
      await this.db.updateUser(userId, user)
      return `使用成功，你获得了${bonusLevel}级符卡！`
    }
    if (item.id === '觉fumo') {
      const status = user.items['觉fumo'].description ? user.items['觉fumo'].description : 'off'
      if (status == 'on')
        user.items['觉fumo'].description = 'off'
      else
        user.items['觉fumo'].description = 'on'
      await this.db.updateUser(userId, user)
      return '切换成功'
    }
    if (item.id === '猫耳发饰') {
      const status = user.items['猫耳发饰'].description ? user.items['猫耳发饰'].description : 'off'
      if (status == 'on')
        user.items['猫耳发饰'].description = 'off'
      else
        user.items['猫耳发饰'].description = 'on'
      await this.db.updateUser(userId, user)
      return '切换成功'
    }
    if (item.id === '心碎魔药') {
      const favorability = user.favorability
      const memory = user.items['心碎魔药'].favorability_limit ? user.items['心碎魔药'].favorability_limit : favorability
      if (favorability <= -9999) {
        user.favorability = memory
        item.count -= 1
        if (item.count === 0) delete user.items[itemId]
        await this.db.updateUser(userId, user)
        return '使用成功，已恢复好感度'
      }
      else {
        user.favorability = -99999
        item.favorability_limit = memory
        await this.db.updateUser(userId, user)
        return '使用成功，已降低好感度'
      }
    }
    return '无法使用此物品'
  }

  // 确保文件存在
  private async ensureShopFile(filePath: string): Promise<void> {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    const initShop = {
      '空白符卡': {
        id: '空白符卡',
        count: 99,
        price: 10000,
        description: '能够承载灵力的卡片',
        favorability_limit: 0
      },
      '败者食尘': {
        id: '败者食尘',
        count: 1,
        price: 100,
        description: '使用后清空所好感度和记忆',
        favorability_limit: 1000
      },
      '消忆药水': {
        id: '消忆药水',
        count: 1,
        price: 12999,
        description: '使用后删除与一个词相关的记忆',
        favorability_limit: 200
      }
    }
    const initShopString = JSON.stringify(initShop, null, 2)
    if (!fs.existsSync(filePath)) { fs.writeFileSync(filePath, initShopString, 'utf-8') }
  }

  // 加载文件
  private async loadShopFile(filePath: string): Promise<Record<string, ItemInfo>> {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {
      return {}
    }
  }

  // 获取用户记忆文件路径
  private getUserMemoryPath(userId: string): string {
    return path.join(this.config.dataDir, 'satori_ai/dialogues', `${userId}.txt`)
  }

  // 确保记忆文件存在
  private async ensureMemoryFile(filePath: string): Promise<void> {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    if (!fs.existsSync(filePath)) { fs.writeFileSync(filePath, '[]', 'utf-8') }
  }

  // 加载记忆文件
  private async loadMemoryFile(filePath: string): Promise<MemoryEntry[]> {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {
      return []
    }
  }
}

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

