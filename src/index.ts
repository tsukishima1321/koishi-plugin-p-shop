import { Context, Schema } from 'koishi'
import { ShopService } from './shop';
export const name = 'p-shop'

export const usage = `
- **指令：p-shop**\n
    别名：p点商店\n
    `;

export const inject = {
  required: ['database'],
  optional: ['puppeteer'],
}

export interface Config {
  dataDir: string
}

export const Config: Schema<Config> = Schema.object({
  dataDir: Schema.string().default("./data").description("数据目录"),
})


export function apply(ctx: Context, cfg: Config) {
  const shop = new ShopService(ctx, cfg)
  ctx.command('p/p-shop <id>').alias('查看商店')
    .action(async ({ session }, id = '') => {return await shop.viewShop(session.userId, id) })
  ctx.command('p/p-bag').alias('查看背包')
    .action(async ({ session }) => {return await shop.viewBag(session.userId) })
  ctx.command('p/p-buy <id> [amount:number]').alias('购买道具')
    .action(async ({ session }, id, amount = 1) => {return await shop.buyItem(ctx, session.userId, id, amount) })
  ctx.command('p/p-sell <id> [amount:number]').alias('出售道具')
    .action(async ({ session }, id, amount = 1) => {return await shop.sellItem(ctx, session.userId, id, amount) })
  ctx.command('p/p-use <id> [...args]').alias('使用道具')
    .action(async ({ session }, id, args) => {return await shop.useItem(ctx, session.userId, id, args ? args.split(' ') : []) })
  ctx.command('p/p-item <id>').alias('查看道具')
    .action(async ({ session }, id) => {return await shop.viewItem(session.userId, id) })
}
