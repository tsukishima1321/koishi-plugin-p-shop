import { Context } from 'koishi'
import { UserData } from './types'

declare module 'koishi' {
  interface Tables {
    p_system: UserData
  }
}
// 数据库服务
export class DatabaseService {
  constructor(private ctx: Context) {
    this.initDatabase(ctx)
  }

  async getUser(userId: string): Promise<UserData> {
    const [user] = await this.ctx.database.get('p_system', { userid: userId })
    return user
  }

  async updateUser(data: Partial<UserData>): Promise<void> {
    await this.ctx.database.set('p_system', { userid: data.userid }, {
      p: data.p,
      favorability: data.favorability,
      deadTime: data.deadTime,
      exchangeTime: data.exchangeTime,
      items: data.items
    })
  }

  // 初始化数据库
  async initDatabase(ctx: Context) {
    ctx.model.extend('p_system', {
      id: 'unsigned',
      userid: 'string',
      usersname: 'string',
      p: 'integer',
      deadTime: 'date',
      exchangeTime: 'date',
      favorability: 'integer',
      items: 'object'
    }, { autoInc: true })
  }
}

