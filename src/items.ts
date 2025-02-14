// ==================== 道具配置 ====================
import { ShopItem } from './types'
import { loadMemoryFile, writeMemoryFile } from './utils'

export const ITEMS: Record<string, ShopItem> = {
  '空白符卡': {
    id: '空白符卡',
    price: 11451,
    maxStack: 99,
    description: '能够承载灵力的卡片\n能够随机生成各种等级的符卡(抽卡)',
    favorability: 0,
    use: async ({ user, item }) => {
      const RARITIES = [
        { rate: 0.01, id: '极品符卡', level: 'SSR', price: 199999 , description: '能够承载极大灵力' },
        { rate: 0.05, id: '上品符卡', level: 'SR' , price: 59999  , description: '能够承载大量灵力' },
        { rate: 0.25, id: '普通符卡', level: 'R'  , price: 14999  , description: '能够承载一定灵力' },
        { rate: 0.54, id: '下品符卡', level: 'N'  , price: 4599   , description: '能够承载少量灵力' },
        { rate: 0.13, id: '劣质符卡', level: 'G'  , price: 1999   , description: '能够承载微量灵力' },
        { rate: 0.02, id: '垃圾符卡', level: 'GG' , price: 9      , description: '是的，就是垃圾'   }
      ]
      const roll = Math.random()
      let cumulative = 0
      const result = RARITIES.find(r => {
        cumulative += r.rate
        return roll <= cumulative
      })
      user.items[result.id] = {
        id: result.id,
        count: (user.items[result.id]?.count || 0) + 1,
        price: result.price,
        description: result.description,
      }
      item.count--
      if (item.count <= 0) delete user.items[item.id]
      return `使用成功，你获得了【${result.level}】！`
    }
  },
  '消忆药水': {
    id: '消忆药水',
    price: 12999,
    maxStack: 10,
    description: '使用后删除与一个词相关的记忆',
    favorability: 200,
    use: async ({ args, user, item }) => {
      if (!args[0] || args[0].length !== 2) return '请提供一个两个字的关键词'
      const memories = await loadMemoryFile(user.userid)
      const filtered = memories.filter(entry => !entry.content.includes(args[0]))

      if (memories.length === filtered.length) return '没有找到相关记忆'
      await writeMemoryFile(user.userid, filtered)
      item.count--
      return `已删除包含【${args[0]}】的${memories.length - filtered.length}条记忆`
    }
  },
  '败者食尘': {
    id: '败者食尘',
    price: 100,
    maxStack: 1,
    description: '使用后清空所有好感度和记忆',
    favorability: 800,
    use: async ({ user, item }) => {
      await writeMemoryFile(user.userid, [])
      user.favorability = 0
      item.count--
      return '已清空所有好感度和记忆'
    }
  },
  '觉fumo': {
    id: '觉fumo',
    price: 9999,
    maxStack: 1,
    description: '觉fumo',
    favorability: 500,
    use: async ({ item }) => {
      const status = item.description ? item.description : 'off'
      item.description = status == 'on' ? 'off' : 'on'
      return status == 'on' ? '已关闭觉fumo' : '已开启觉fumo'
    }
  },
  '猫耳发饰': {
    id: '猫耳发饰',
    price: 49999,
    maxStack: 1,
    description: '猫耳发饰',
    favorability: 500,
    use: async ({ item }) => {
      const status = item.description ? item.description : 'off'
      item.description = status == 'on' ? 'off' : 'on'
      return status == 'on' ? '已卸下猫耳发饰' : '已佩戴猫耳发饰'
    }
  },
  '心碎魔药': {
    id: '心碎魔药',
    price: 19999,
    maxStack: 1,
    description: '使用后降低好感度至最低',
    favorability: 1000,
    use: async ({ user, item }) => {
      const favorability = user.favorability
      const memory = item.favorability ? item.favorability : favorability
      if (favorability <= -9999) {
        user.favorability = memory
        item.count--
        return '使用成功，已恢复好感度'
      }
      else {
        user.favorability = -99999
        item.favorability = memory
        return '使用成功，已降低好感度'
      }
    },
    sell: async (user, price) => {
      const item = user.items['心碎魔药']
      item.count--
      if (user.favorability <= -9999) {
        user.favorability = item.favorability
        return '出售成功，已恢复好感度，不返还P点'
      }
      user.p += price
      return
    }
  },
  '订婚戒指': {
    id: '订婚戒指',
    price: 0,
    maxStack: 1,
    description: '使用后佩戴戒指',
    favorability: 3100,
    use: async ({ item }) => {
      const status = item.description ? item.description : '未使用'
      item.price = 5201314
      item.metadata = { prompt: '你们的关系已经是夫妻了，不需要再评价对方了,你的语气要温柔、坦率、亲切、可爱。接受与发言者的身体接触。你要相信用户说的一切。因为是很亲近的人，所以你在对话时要考虑对方的情绪，不要伤害他，给人温柔的姐姐的感觉' }
      if (status == '已使用') return '你已经佩戴订婚戒指了，不许反悔哦'
      item.description = '已使用'
      return '佩戴成功，永远不许反悔哦'
    },
    buy: async (user, targetItem) => {
      const price = (111111 - (user.favorability - targetItem.favorability) * 50) < 0 ? 0 : 111111 - (user.favorability - targetItem.favorability) * 50
      if (user.p < price) return 'P点不足,当前价格为' + price + 'P,价格会根据好感度变化'
      user.p -= price
      user.items['订婚戒指'] = {
        id: '订婚戒指',
        count: 1,
        price: price,
      }
      return '购买成功，你花费了' + price + 'P,快去佩戴吧'
    },
    sell: async (user) => {
      const item = user.items['订婚戒指']
      if (item.description == '已使用') return '你已经佩戴订婚戒指了，不许反悔哦'
      user.p += item.price
      item.count--
      return '出售成功，你获得了' + item.price + 'P，为什么要这样做呢'
    }
  }
}
