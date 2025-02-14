// ==================== 默认道具配置 ====================
import { ShopItem } from './types'
import { loadMemoryFile, writeMemoryFile } from './utils'

export const DEFAULT_ITEMS: Record<string, ShopItem> = {
  'blank-card': {
    id: '空白符卡',
    description: '能够承载灵力的卡片\n能够随机生成各种等级的符卡(抽卡)',
    price: 11451,
    maxStack: 99,
    favorability: 0,
    onUse: async ({ user, item }) => {
      const RARITIES = [
        { rate: 0.01, id: '极品符卡', name: 'SSR级符卡', price: 199999 , description: '能够承载极大灵力' },
        { rate: 0.05, id: '上品符卡', name: 'SR级符卡', price: 59999 , description: '能够承载大量灵力' },
        { rate: 0.25, id: '普通符卡', name: 'R级符卡', price: 14999 , description: '能够承载一定灵力' },
        { rate: 0.54, id: '下品符卡', name: 'N级符卡', price: 4599 , description: '能够承载少量灵力' },
        { rate: 0.13, id: '劣质符卡', name: 'G级符卡', price: 1999 , description: '能够承载微量灵力' },
        { rate: 0.02, id: '垃圾符卡', name: 'GG级符卡', price: 9 , description: '是的，就是垃圾' }
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
      return `使用成功，你获得了【${result.name}】！`
    }
  },
  'memory-potion': {
    id: '消忆药水',
    description: '使用后删除与一个词相关的记忆',
    price: 12999,
    maxStack: 10,
    favorability: 200,
    onUse: async ({ args, user, item }) => {
      if (!args[0] || args[0].length !== 2) return '请提供一个两个字的关键词'
      const keyword = args[0]
      const memories = await loadMemoryFile(user.userid)
      const filtered = memories.filter(entry => !entry.content.includes(keyword))

      if (memories.length === filtered.length) return '没有找到相关记忆'
      await writeMemoryFile(user.userid, filtered)
      item.count--
      if (item.count === 0) delete user.items[item.id]
      return `已删除包含【${keyword}】的${memories.length - filtered.length}条记忆`
    }
  },
  'memory-wipe': {
    id: '败者食尘',
    description: '使用后清空所有好感度和记忆',
    price: 100,
    maxStack: 1,
    favorability: 800,
    onUse: async ({ user, item }) => {
      await writeMemoryFile(user.userid, [])
      user.favorability = 0
      item.count--
      if (item.count === 0) delete user.items[item.id]
      return '已清空所有好感度和记忆'
    }
  },
  '觉fumo': {
    id: '觉fumo',
    description: '觉fumo',
    price: 9999,
    maxStack: 1,
    favorability: 500,
    onUse: async ({ item }) => {
      const status = item.description ? item.description : 'off'
      if (status == 'on')
        item.description = 'off'
      else
        item.description = 'on'
      return '切换成功'
    }
  },
  '猫耳发饰': {
    id: '猫耳发饰',
    description: '猫耳发饰',
    price: 49999,
    maxStack: 1,
    favorability: 500,
    onUse: async ({ item }) => {
      const status = item.description ? item.description : 'off'
      if (status == 'on')
        item.description = 'off'
      else
        item.description = 'on'
      return '切换成功'
    }
  },
  '心碎魔药': {
    id: '心碎魔药',
    description: '使用后降低好感度至最低',
    price: 19999,
    maxStack: 1,
    favorability: 1000,
    onUse: async ({ user, item }) => {
      const favorability = user.favorability
      const memory = item.favorability ? item.favorability : favorability
      if (favorability <= -9999) {
        user.favorability = memory
        item.count--
        if (item.count === 0) delete user.items[item.id]
        return '使用成功，已恢复好感度'
      }
      else {
        user.favorability = -99999
        item.favorability = memory
        return '使用成功，已降低好感度'
      }
    }
  },
  '订婚戒指': {
    id: '订婚戒指',
    description: '使用后佩戴戒指',
    price: 99999,
    maxStack: 1,
    favorability: 3100,
    onUse: async ({ item }) => {
      const status = item.description ? item.description : '未使用'
      if (status == '已使用') return '你已经佩戴了订婚戒指，不许反悔哦'
      item.description = '已使用'
      return '佩戴成功，永远不许反悔哦'
    },
    onBuy: async (user, amount, targetItem) => {
      if (user.items['订婚戒指']) return '你已经拥有了订婚戒指'
      return
    }
  }
}
